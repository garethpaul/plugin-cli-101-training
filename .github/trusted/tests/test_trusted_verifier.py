#!/usr/bin/env python3
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import tarfile
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[3]
VERIFIER_PATH = ROOT / ".github" / "trusted" / "verify_candidate.py"
POLICY_PATH = ROOT / ".github" / "trusted" / "policy.json"
PATCH_PATH = ROOT / ".github" / "trusted" / "semantic-v1.patch.gz"
SIGNED_DEFAULT = "756bb270124a981bef747931a7817a3ead5f5257"


def load_verifier():
    spec = importlib.util.spec_from_file_location("trusted_verifier", VERIFIER_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def make_archive(files, modes=None, kinds=None):
    modes = modes or {}
    kinds = kinds or {}
    output = io.BytesIO()
    with tarfile.open(fileobj=output, mode="w:gz", format=tarfile.PAX_FORMAT) as archive:
        for name, data in files.items():
            info = tarfile.TarInfo(name)
            info.mode = modes.get(name, 0o644)
            info.mtime = 0
            kind = kinds.get(name, "file")
            if kind == "symlink":
                info.type = tarfile.SYMTYPE
                info.linkname = data.decode()
                info.size = 0
                archive.addfile(info)
            else:
                info.size = len(data)
                archive.addfile(info, io.BytesIO(data))
    return output.getvalue()


class TrustedVerifierTests(unittest.TestCase):
    def setUp(self):
        self.verifier = load_verifier()
        self.package = b'{"name":"training","scripts":{"test":"node test.js"}}\n'
        self.runtime = b"module.exports = Object.freeze({value: 'safe'});\n"
        self.policy = {
            "check_name": "trusted-package/bootstrap-v1",
            "semantic_patch_sha256": sha256(b"exact semantic patch\n"),
            "archive": {
                "package/package.json": {
                    "mode": "0644",
                    "sha256": sha256(self.package),
                },
                "package/src/runtime.js": {
                    "mode": "0644",
                    "sha256": sha256(self.runtime),
                },
            },
            "allowed_scripts": ["test"],
            "forbidden_lifecycle_scripts": [
                "preinstall",
                "install",
                "postinstall",
                "prepack",
                "prepare",
                "postpack",
                "publish",
            ],
        }

    def assert_archive_rejected(self, files, message):
        archive = make_archive(files)
        with self.assertRaisesRegex(self.verifier.VerificationError, message):
            self.verifier.verify_archive_bytes(archive, self.policy)

    def test_accepts_exact_closed_archive(self):
        archive = make_archive(
            {
                "package/package.json": self.package,
                "package/src/runtime.js": self.runtime,
            }
        )
        result = self.verifier.verify_archive_bytes(archive, self.policy)
        self.assertEqual(result["members"], 2)

    def test_rejects_atom_stall_runtime(self):
        self.assert_archive_rejected(
            {
                "package/package.json": self.package,
                "package/src/runtime.js": b"Atomics.waitAsync(new Int32Array(new SharedArrayBuffer(4)), 0);\n",
            },
            "digest mismatch",
        )

    def test_rejects_worker_timer_child_and_shared_state_modules(self):
        payloads = (
            b"require('worker_threads').Worker;\n",
            b"setInterval(() => {}, 1 << 30);\n",
            b"require('child_process').spawn('node');\n",
            b"globalThis.sharedState = require('./state');\n",
        )
        for payload in payloads:
            with self.subTest(payload=payload):
                self.assert_archive_rejected(
                    {
                        "package/package.json": self.package,
                        "package/src/runtime.js": payload,
                    },
                    "digest mismatch",
                )

    def test_rejects_extra_generated_runtime_file(self):
        self.assert_archive_rejected(
            {
                "package/package.json": self.package,
                "package/src/runtime.js": self.runtime,
                "package/src/generated.js": b"module.exports = require('child_process');\n",
            },
            "archive members differ",
        )

    def test_rejects_lifecycle_generation(self):
        package = json.loads(self.package)
        package["scripts"]["prepare"] = "node generate-unsafe-runtime.js"
        self.assert_archive_rejected(
            {
                "package/package.json": (json.dumps(package) + "\n").encode(),
                "package/src/runtime.js": self.runtime,
            },
            "forbidden lifecycle script",
        )

    def test_rejects_links_and_path_traversal(self):
        symlink = make_archive(
            {"package/package.json": b"../../outside"},
            kinds={"package/package.json": "symlink"},
        )
        with self.assertRaisesRegex(self.verifier.VerificationError, "regular files"):
            self.verifier.verify_archive_bytes(symlink, self.policy)

        traversal = make_archive({"package/../outside": b"unsafe"})
        with self.assertRaisesRegex(self.verifier.VerificationError, "unsafe archive path"):
            self.verifier.verify_archive_bytes(traversal, self.policy)

    def test_rejects_joint_policy_laundering_as_patch_mismatch(self):
        self.verifier.verify_semantic_patch(b"exact semantic patch\n", self.policy)
        with self.assertRaisesRegex(self.verifier.VerificationError, "semantic patch digest mismatch"):
            self.verifier.verify_semantic_patch(
                b"exact semantic patch\nplus laundered verifier changes\n",
                self.policy,
            )

    def test_load_policy_reads_gzip_patch_and_hashes_uncompressed_bytes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            patch = b"exact semantic patch with inherited whitespace: \n"
            import gzip

            with (root / "semantic.patch.gz").open("wb") as output:
                with gzip.GzipFile(filename="", mode="wb", fileobj=output, mtime=0) as stream:
                    stream.write(patch)
            policy = {
                "semantic_patch_file": "semantic.patch.gz",
                "semantic_patch_sha256": sha256(patch),
            }
            policy_path = root / "policy.json"
            policy_path.write_text(json.dumps(policy))
            self.assertEqual(
                self.verifier.load_policy(policy_path)["semantic_patch_sha256"],
                sha256(patch),
            )

    def test_load_policy_rejects_mutated_frozen_patch(self):
        import gzip

        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            patch = b"exact semantic patch\n"
            mutated = patch + b"candidate mutation\n"
            with (root / "semantic.patch.gz").open("wb") as output:
                with gzip.GzipFile(filename="", mode="wb", fileobj=output, mtime=0) as stream:
                    stream.write(mutated)
            policy_path = root / "policy.json"
            policy_path.write_text(
                json.dumps(
                    {
                        "semantic_patch_file": "semantic.patch.gz",
                        "semantic_patch_sha256": sha256(patch),
                    }
                ),
                encoding="utf-8",
            )
            with self.assertRaisesRegex(
                self.verifier.VerificationError,
                "trusted semantic patch digest mismatch",
            ):
                self.verifier.load_policy(policy_path)

    def test_sanitized_environment_removes_node_and_shell_injection(self):
        hostile = {
            "PATH": "/candidate/bin:/usr/bin:/bin",
            "HOME": "/candidate/home",
            "NODE_OPTIONS": "--require=/candidate/preload.js",
            "NODE_PATH": "/candidate/modules",
            "BASH_ENV": "/candidate/bash-env",
            "ENV": "/candidate/sh-env",
            "GIT_CONFIG_GLOBAL": "/candidate/gitconfig",
            "npm_config_userconfig": "/candidate/npmrc",
            "PYTHONHOME": "/candidate/python-home",
            "PYTHONPATH": "/candidate/python-path",
            "PYTHONSTARTUP": "/candidate/startup.py",
        }
        clean = self.verifier.sanitized_environment(hostile, "/trusted/home")
        self.assertEqual(clean["PATH"], "/usr/bin:/bin")
        self.assertEqual(clean["HOME"], "/trusted/home")
        for name in (
            "NODE_OPTIONS",
            "NODE_PATH",
            "BASH_ENV",
            "ENV",
            "PYTHONHOME",
            "PYTHONPATH",
            "PYTHONSTARTUP",
        ):
            self.assertNotIn(name, clean)
        self.assertEqual(clean["GIT_CONFIG_GLOBAL"], "/dev/null")
        self.assertEqual(clean["npm_config_userconfig"], "/dev/null")
        self.assertEqual(clean["npm_config_ignore_scripts"], "true")

    def test_workflow_uses_base_controlled_app_check(self):
        workflow = (ROOT / ".github" / "workflows" / "trusted-package.yml").read_text()
        self.assertIn("pull_request_target:", workflow)
        self.assertIn("branches: [main]", workflow)
        self.assertIn("permissions: {}", workflow)
        self.assertIn("trusted-package-verifier", workflow)
        self.assertIn("actions/create-github-app-token@bcd2ba49218906704ab6c1aa796996da409d3eb1", workflow)
        self.assertIn("permission-checks: write", workflow)
        self.assertIn("github.event.pull_request.base.sha", workflow)
        self.assertIn("github.event.pull_request.head.sha", workflow)
        self.assertGreaterEqual(workflow.count("/usr/bin/python3 -I -S"), 3)
        self.assertGreaterEqual(workflow.count("env -i"), 3)
        self.assertNotIn("actions/checkout@", workflow)
        self.assertNotIn("npm test", workflow)
        self.assertNotIn("npm pack", workflow)
        self.assertNotIn("pull_request:\n", workflow)

    def test_authenticated_patch_includes_required_check_workflow_hunk(self):
        import gzip

        patch = gzip.decompress(PATCH_PATH.read_bytes())
        policy = json.loads(POLICY_PATH.read_text(encoding="utf-8"))
        self.assertEqual(sha256(patch), policy["semantic_patch_sha256"])
        self.assertIn(b"diff --git a/.github/workflows/check.yml b/.github/workflows/check.yml", patch)
        self.assertIn(b"-    timeout-minutes: 10\n+    timeout-minutes: 20", patch)
        self.assertIn(
            b"-        run: npm pack --dry-run\n+        run: node scripts/build-package.js --verify-only",
            patch,
        )

    def test_python_isolated_mode_ignores_hostile_sitecustomize(self):
        with tempfile.TemporaryDirectory() as directory:
            hostile = Path(directory)
            marker = hostile / "sitecustomize-loaded"
            (hostile / "sitecustomize.py").write_text(
                f"from pathlib import Path\nPath({str(marker)!r}).write_text('loaded')\n",
                encoding="utf-8",
            )
            environment = dict(os.environ)
            environment["PYTHONPATH"] = str(hostile)
            environment["PYTHONSTARTUP"] = str(hostile / "sitecustomize.py")
            result = subprocess.run(
                ["/usr/bin/python3", "-I", "-S", "-c", "import sys; print(sys.flags.isolated)"],
                check=False,
                capture_output=True,
                text=True,
                env=environment,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(result.stdout.strip(), "1")
            self.assertFalse(marker.exists())

    @unittest.skipUnless(
        os.environ.get("TRUSTED_BOOTSTRAP_E2E") == "1",
        "set TRUSTED_BOOTSTRAP_E2E=1 for full semantic application",
    )
    def test_authenticated_patch_applies_and_passes_full_node_checks(self):
        import gzip

        with tempfile.TemporaryDirectory() as directory:
            checkout = Path(directory) / "semantic"
            trusted_home = str(Path(directory) / "home")
            git_environment = self.verifier.sanitized_environment(os.environ, home=trusted_home)
            subprocess.run(
                ["git", "clone", "--no-local", "--quiet", str(ROOT), str(checkout)],
                check=True,
                env=git_environment,
            )
            subprocess.run(
                ["git", "checkout", "--quiet", SIGNED_DEFAULT],
                cwd=checkout,
                check=True,
                env=git_environment,
            )
            patch = gzip.decompress(PATCH_PATH.read_bytes())
            subprocess.run(
                ["git", "apply", "--check", "-"],
                cwd=checkout,
                input=patch,
                check=True,
                env=git_environment,
            )
            subprocess.run(
                ["git", "apply", "-"],
                cwd=checkout,
                input=patch,
                check=True,
                env=git_environment,
            )
            node_environment = self.verifier.sanitized_environment(os.environ, home=trusted_home)
            node_environment["PATH"] = os.environ["PATH"]
            subprocess.run(
                ["npm", "ci", "--ignore-scripts", "--no-audit", "--no-fund"],
                cwd=checkout,
                check=True,
                env=node_environment,
            )
            subprocess.run(["npm", "test"], cwd=checkout, check=True, env=node_environment)


if __name__ == "__main__":
    unittest.main()
