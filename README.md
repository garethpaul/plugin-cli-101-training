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
twilio plugins:install @twilio-labs/plugin-serverless
twilio serverless:init cli-101-training
```

```
twilio plugins:install @garethpaul/plugin-cli-101-training    
```

```
twilio plugins:install @twilio-labs/plugin-watch
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
