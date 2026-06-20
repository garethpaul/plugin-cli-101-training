#!/usr/bin/env python3
import argparse
import gzip
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import tarfile


ROOT = Path(__file__).resolve().parent
POLICY_PATH = ROOT / "policy.json"
HEX_SHA = re.compile(r"[0-9a-f]{40}")
SAFE_PATH = "/usr/bin:/bin"


class VerificationError(RuntimeError):
    pass


def digest(data):
    return hashlib.sha256(data).hexdigest()


def load_policy(path=POLICY_PATH):
    policy = json.loads(Path(path).read_text(encoding="utf-8"))
    patch_path = Path(path).parent / policy["semantic_patch_file"]
    patch = patch_path.read_bytes()
    if patch_path.suffix == ".gz":
        patch = gzip.decompress(patch)
    if digest(patch) != policy["semantic_patch_sha256"]:
        raise VerificationError("trusted semantic patch digest mismatch")
    return policy


def sanitized_environment(source=None, home=None):
    source = dict(source or {})
    clean = {
        "HOME": home or "/tmp/trusted-verifier-home",
        "LANG": "C.UTF-8",
        "LC_ALL": "C.UTF-8",
        "PATH": SAFE_PATH,
        "GIT_CONFIG_NOSYSTEM": "1",
        "GIT_CONFIG_GLOBAL": "/dev/null",
        "npm_config_ignore_scripts": "true",
        "npm_config_userconfig": "/dev/null",
    }
    if "TMPDIR" in source:
        clean["TMPDIR"] = source["TMPDIR"]
    return clean


def run_git(git_dir, *arguments, binary=False):
    command = ["git", "--git-dir", str(git_dir), *arguments]
    result = subprocess.run(
        command,
        check=False,
        capture_output=True,
        env=sanitized_environment(os.environ),
    )
    if result.returncode:
        stderr = result.stderr.decode("utf-8", "replace").strip()
        raise VerificationError(f"git command failed: {stderr}")
    return result.stdout if binary else result.stdout.decode("utf-8", "strict")


def validate_sha(value, label):
    if not HEX_SHA.fullmatch(value):
        raise VerificationError(f"invalid {label} SHA")


def verify_topology(git_dir, base, head):
    validate_sha(base, "base")
    validate_sha(head, "head")
    parents = run_git(git_dir, "rev-list", "--parents", "-n", "1", head).strip().split()
    if parents != [head, base]:
        raise VerificationError("candidate must be exactly one commit with the live base as sole parent")


def semantic_patch(git_dir, base, head):
    return run_git(
        git_dir,
        "diff",
        "--binary",
        "--full-index",
        "--no-ext-diff",
        "--no-renames",
        base,
        head,
        "--",
        ".",
        binary=True,
    )


def verify_semantic_patch(patch, policy):
    actual = digest(patch)
    if actual != policy["semantic_patch_sha256"]:
        raise VerificationError(
            f"semantic patch digest mismatch: expected {policy['semantic_patch_sha256']}, got {actual}"
        )


def git_blob(git_dir, head, source):
    return run_git(git_dir, "show", f"{head}:{source}", binary=True)


def git_mode(git_dir, head, source):
    fields = run_git(git_dir, "ls-tree", head, "--", source).strip().split()
    if len(fields) < 4 or fields[1] != "blob":
        raise VerificationError(f"package source is not a regular blob: {source}")
    return "0755" if fields[0] == "100755" else "0644" if fields[0] == "100644" else fields[0]


def build_archive(git_dir, head, policy):
    raw = io.BytesIO()
    with gzip.GzipFile(filename="", mode="wb", fileobj=raw, mtime=0) as compressed:
        with tarfile.open(fileobj=compressed, mode="w", format=tarfile.USTAR_FORMAT) as archive:
            for name, expected in sorted(policy["archive"].items()):
                source = expected["source"]
                data = git_blob(git_dir, head, source)
                mode = git_mode(git_dir, head, source)
                if mode != expected["mode"]:
                    raise VerificationError(f"source mode mismatch for {source}")
                info = tarfile.TarInfo(name)
                info.mode = int(mode, 8)
                info.size = len(data)
                info.mtime = 0
                info.uid = 0
                info.gid = 0
                info.uname = ""
                info.gname = ""
                archive.addfile(info, io.BytesIO(data))
    return raw.getvalue()


def validate_archive_path(name):
    if "\\" in name:
        raise VerificationError(f"unsafe archive path: {name}")
    path = PurePosixPath(name)
    if path.is_absolute() or any(part in ("", ".", "..") for part in path.parts):
        raise VerificationError(f"unsafe archive path: {name}")
    if not name.startswith("package/"):
        raise VerificationError(f"unsafe archive path: {name}")


def verify_package_json(data, policy):
    try:
        package = json.loads(data)
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise VerificationError("package.json is not canonical JSON") from error
    scripts = package.get("scripts", {})
    if not isinstance(scripts, dict):
        raise VerificationError("package scripts must be an object")
    forbidden = set(policy["forbidden_lifecycle_scripts"]).intersection(scripts)
    if forbidden:
        raise VerificationError(f"forbidden lifecycle script: {sorted(forbidden)[0]}")
    if sorted(scripts) != sorted(policy["allowed_scripts"]):
        raise VerificationError("package script inventory differs from trusted policy")


def verify_archive_bytes(data, policy):
    expected = policy["archive"]
    seen = {}
    try:
        archive = tarfile.open(fileobj=io.BytesIO(data), mode="r:gz")
    except tarfile.TarError as error:
        raise VerificationError("candidate package is not a valid gzip tarball") from error
    with archive:
        for member in archive:
            validate_archive_path(member.name)
            if member.name in seen:
                raise VerificationError(f"duplicate archive member: {member.name}")
            if not member.isfile():
                raise VerificationError("archive members must be regular files")
            if member.size > 1_000_000:
                raise VerificationError(f"archive member too large: {member.name}")
            stream = archive.extractfile(member)
            if stream is None:
                raise VerificationError(f"archive member unreadable: {member.name}")
            seen[member.name] = (member, stream.read())
    if set(seen) != set(expected):
        raise VerificationError("archive members differ from the closed trusted inventory")
    package_data = seen["package/package.json"][1]
    verify_package_json(package_data, policy)
    for name, expected_member in expected.items():
        member, member_data = seen[name]
        mode = f"{member.mode & 0o777:04o}"
        if mode != expected_member["mode"]:
            raise VerificationError(f"mode mismatch for {name}")
        if member.mtime != 0 or member.uid != 0 or member.gid != 0:
            raise VerificationError(f"non-deterministic metadata for {name}")
        actual = digest(member_data)
        if actual != expected_member["sha256"]:
            raise VerificationError(f"digest mismatch for {name}")
    return {"members": len(seen), "sha256": digest(data)}


def verify_candidate(git_dir, base, head, output):
    policy = load_policy()
    verify_topology(git_dir, base, head)
    verify_semantic_patch(semantic_patch(git_dir, base, head), policy)
    archive = build_archive(git_dir, head, policy)
    result = verify_archive_bytes(archive, policy)
    Path(output).write_bytes(archive)
    return {
        "base": base,
        "head": head,
        "check_name": policy["check_name"],
        "semantic_patch_sha256": policy["semantic_patch_sha256"],
        "archive_sha256": result["sha256"],
        "archive_members": result["members"],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--git-dir", required=True)
    parser.add_argument("--base", required=True)
    parser.add_argument("--head", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--summary", required=True)
    arguments = parser.parse_args()
    try:
        summary = verify_candidate(
            Path(arguments.git_dir),
            arguments.base,
            arguments.head,
            arguments.output,
        )
    except VerificationError as error:
        Path(arguments.summary).write_text(
            json.dumps({"verified": False, "error": str(error)}, indent=2) + "\n",
            encoding="utf-8",
        )
        raise SystemExit(str(error)) from error
    Path(arguments.summary).write_text(
        json.dumps({"verified": True, **summary}, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
