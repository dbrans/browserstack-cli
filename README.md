browserstack-cli
================

Awesome command line interface for the browserstack api.

## Installation

    npm install -g browserstack-cli

## Usage

### Setup

Setup your credentials and API key. This will prompt for your BrowserStack username/password and your tunneling API keys, which you can get from their [automated browser testing page](http://www.browserstack.com/automated-browser-testing-api) and [local testing page](http://www.browserstack.com/local-testing#cmd-tunnel) while you are logged in.

    browserstack setup

### Available Browsers

Get a list of available browsers:

    browserstack browsers

### Launch a Browser

Launch firefox 3.6 and point it to google.com:

    browserstack launch firefox:3.6 http://google.com

Launch will use the latest version if none is specified:

    browserstack launch firefox http://google.com

Using the ``--attach`` option keeps the program running until it receives a SIGTERM or a SIGINT (CTRL-C) signal, at which point it kills the remote browser and then exits.

    browserstack launch --attach firefox http://google.com

Can you launch mobile browsers? Yes.

    browserstack launch "iPhone 5" http://google.com

### List Active Jobs

    browserstack jobs

### Killing Jobs

Kill a job by ID

    browserstack kill 514664

or kill'em all

    browserstack killall

### Tunneling

    browserstack tunnel localhost:8080

## Usage

    Usage: cli.js [options] [command]

    Commands:

      setup                  Initial setup
      launch <browser> <url> Launch a browser
      browsers               List available browsers
      jobs                   List active jobs
      kill <job_id>          Kill an active job
      killall                Kill all active jobs
      tunnel <host:port>     Setup tunneling
      status                 Get the current status

    Options:

      -h, --help                  output usage information
      -V, --version               output the version number
      -u, --user <user:password>  Browserstack authentication
      -a, --attach                Attach process to launched browser
      -o, --os                    The os of the browser or device. Defaults to "win"
      -t, --timeout <seconds>     Launch duration after which browsers exit
      -p, --private               Use the private web tunneling key for manual testing
      -k, --key <key>             Tunneling key

## Programmatic API

`browserstack-cli` is supported by a companion library [browseroverflow](https://github.com/airportyh/browseroverflow) which is essentially a one-to-one mapping of `browserstack-cli's` commands to API calls.

## Issues, Questions?

To ask a question or report an issue, please open a [github issue](https://github.com/airportyh/browserstack-cli/issues/new).

## Contributors

* [Derek Brans](http://github.com/dbrans)
* [Toby Ho](http://github.com/airportyh)
