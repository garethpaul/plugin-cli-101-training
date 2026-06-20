#!/usr/bin/env python3
import json
import os
from pathlib import Path
import re
import urllib.request


REPOSITORY = re.compile(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+")
SHA = re.compile(r"[0-9a-f]{40}")
CHECK_NAME = "trusted-package/bootstrap-v1"


def required(name):
    value = os.environ.get(name, "")
    if not value:
        raise SystemExit(f"missing {name}")
    return value


repository = required("GH_REPO")
head = required("HEAD_SHA")
token = required("APP_TOKEN")
conclusion = required("CONCLUSION")
summary_path = Path(required("SUMMARY_FILE"))

if not REPOSITORY.fullmatch(repository):
    raise SystemExit("invalid repository")
if not SHA.fullmatch(head):
    raise SystemExit("invalid head SHA")
if conclusion not in {"success", "failure"}:
    raise SystemExit("invalid conclusion")

if summary_path.is_file():
    summary = summary_path.read_text(encoding="utf-8")[:60000]
else:
    summary = json.dumps({"verified": False, "error": "verification did not produce a summary"})

payload = json.dumps(
    {
        "name": CHECK_NAME,
        "head_sha": head,
        "status": "completed",
        "conclusion": conclusion,
        "output": {
            "title": "Trusted package verification",
            "summary": f"```json\n{summary}\n```",
        },
    }
).encode()
request = urllib.request.Request(
    f"https://api.github.com/repos/{repository}/check-runs",
    data=payload,
    method="POST",
    headers={
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "plugin-cli-101-training-trusted-verifier",
        "X-GitHub-Api-Version": "2022-11-28",
    },
)
with urllib.request.urlopen(request, timeout=30) as response:
    if response.status != 201:
        raise SystemExit(f"unexpected check API status: {response.status}")
