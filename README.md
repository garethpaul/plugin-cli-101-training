@garethpaul/cli-101-training
========================

# CLI 101 Training

This page should describe some of the contents for Twilio CLI 101. 

## Suggested Reading

* [CLI Docs](https://www.twilio.com/docs/twilio-cli)
* [CLI Plugin Docs](https://www.twilio.com/docs/twilio-cli/plugins)
* [CLI Features Blog Post](https://www.twilio.com/blog/five-twilio-cli-features-you-should-know-about)
* [CLI Plugins Flex Deploy and Release](https://www.twilio.com/docs/flex/developer/plugins/cli/deploy-and-release)

## Key Concepts

### Install

```
brew tap twilio/brew && brew install twilio
```

```
npm install twilio-cli -g
```

### Login / Auth


```
twilio login
```

```
twilio profiles:create
```

```
export TWILIO_ACCOUNT_SID="";
export TWILIO_API_KEY="";
export TWILIO_API_SECRET="";
```


### Commands

```
twilio api:core:messages:list -o json
twilio debugger:logs:list
```

### Plugins

```
twilio plugins:install @garethpaul/plugin-cli-101-training    
```

```
twilio plugins:install @twilio-labs/plugin-watch
```

## Contents

<!-- toc -->
* [CLI 101 Training](#cli-101-training)
<!-- tocstop -->
## Install

```
$ twilio plugins:install @garethpaul/plugin-cli-101-training    
```

## Usage

```sh-session
$ twilio cli-101-training
```


## Commands
<!-- commands -->
* [`twilio cli-101-training:examples`](#twilio-cli-101-trainingexamples)
* [`twilio cli-101-training:feedback`](#twilio-cli-101-trainingfeedback)
* [`twilio cli-101-training:welcome`](#twilio-cli-101-trainingwelcome)

## `twilio cli-101-training:examples`

Twilio 101 Examples

```
USAGE
  $ twilio cli-101-training:examples

OPTIONS
  --stage=development|staging|production
```

_See code: [src/commands/cli-101-training/examples.js](https://github.com/garethpaul/plugin-cli-101-training/blob/2.0.1/src/commands/cli-101-training/examples.js)_

## `twilio cli-101-training:feedback`

Welcome to Twilio 101 Training

```
USAGE
  $ twilio cli-101-training:feedback

OPTIONS
  -l=(debug|info|warn|error|none)  [default: info] Level of logging messages.
  -o=(columns|json|tsv)            [default: columns] Format of command output.
  -p, --profile=profile            Shorthand identifier for your profile.
```

_See code: [src/commands/cli-101-training/feedback.js](https://github.com/garethpaul/plugin-cli-101-training/blob/2.0.1/src/commands/cli-101-training/feedback.js)_

## `twilio cli-101-training:welcome`

Welcome to Twilio 101 Training

```
USAGE
  $ twilio cli-101-training:welcome

OPTIONS
  -l=(debug|info|warn|error|none)  [default: info] Level of logging messages.
  -o=(columns|json|tsv)            [default: columns] Format of command output.
  -p, --profile=profile            Shorthand identifier for your profile.
```

_See code: [src/commands/cli-101-training/welcome.js](https://github.com/garethpaul/plugin-cli-101-training/blob/2.0.1/src/commands/cli-101-training/welcome.js)_
<!-- commandsstop -->

```
$ twilio cli-101-training:welcome
```

```
$ twilio cli-101-training:examples
```

```
$ twilio cli-101-training:feedback
```

```
$ twilio cli-101-training:tips
```

## Tips

Here are some generalized tips

### Enable Autocomplete
```
$ twilio autocomplete
```

### Enable Help
```
$ twilio --help
```

### Enable Twilio Debugging

```
$ twilio api:core:applications:list -l debug
```

### Enable Verbose Debugging
```
env DEBUG=*
```

### Enable Autocomplete

```
  $ twilio autocomplete
```

## Examples

```
  $ twilio profiles:list
  $ twilio profiles:create
  $ twilio profiles:use dev

  $ twilio api:core:keys:create --friendly-name=voice-client-javascript -o json
  
  $ twilio api:core:messages:list -o json
  $ twilio api:core:messages:list -o tsv
  
  $ twilio api:core:accounts:list

```

### ngrok
```
  $ http-server --proxy http://localhost:8080
  $ twilio phone-numbers:update +12107574383 --sms-url=https://localhost:8080

```
