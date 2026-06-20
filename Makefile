.PHONY: build check lint test trusted-bootstrap-test verify

ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
NPM ?= npm

lint:
	cd "$(ROOT)" && $(NPM) run lint

test:
	cd "$(ROOT)" && $(NPM) test

build:
	cd "$(ROOT)" && $(NPM) run build

trusted-bootstrap-test:
	cd "$(ROOT)" && TRUSTED_BOOTSTRAP_E2E=1 /usr/bin/python3 -I -S .github/trusted/tests/test_trusted_verifier.py

verify: lint test build

check: verify
