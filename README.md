browserstack-cli
================

Awesome command line interface for the browserstack api.

## Installation

    npm install -g browserstack-cli

## Overview

Setup your credentials and API key. This will prompt for your BrowserStack username/password and your tunneling API keys, which you can get from their [automated browser testing page](http://www.browserstack.com/automated-browser-testing-api) and [local testing page](http://www.browserstack.com/local-testing#cmd-tunnel).

    browserstack setup

Get a list of available browsers:

    browserstack browsers

Launch firefox 3.6 and point it to google.com:

    browserstack launch firefox:3.6 http://google.com

Output

    Launched job 1059006.

Launch will use the latest version if none is specified. Launch latest firefox and point it to google.com:

    browserstack launch firefox http://google.com

Using the ``--attach`` option keeps the program running until it receives a SIGTERM or a SIGINT (CTRL-C) signal, at which point it kills the remote browser and then exits.

    browserstack launch --attach firefox http://google.com

List all jobs

    browserstack jobs

Kill a job:

    browserstack kill 514664

Kill all jobs:

    browserstack killall

tunnel `localhost:8080` to BrowserStack:

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

## Issues, Questions?

To ask a question or report an issue, please open a [github issue](https://github.com/airportyh/browserstack-cli/issues/new).

## Contributors

* [Derek Brans](http://github.com/dbrans)
* [Toby Ho](http://github.com/airportyh)
