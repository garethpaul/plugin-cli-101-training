.PHONY: build check lint test verify

ifneq ($(origin MAKEFILE_LIST),file)
$(error MAKEFILE_LIST must not be overridden)
endif
override ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
NPM ?= npm

lint:
	cd "$(ROOT)" && $(NPM) run lint

test:
	cd "$(ROOT)" && $(NPM) test

build:
	cd "$(ROOT)" && $(NPM) run build

verify: lint test build

check: verify
