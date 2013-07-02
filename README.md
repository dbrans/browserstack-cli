# This repo is deprecated
The most up-to-date code for the [npm package](https://npmjs.org/package/browserstack-cli) lives at https://github.com/airportyh/browserstack-cli/

browserstack-cli
================

A command line interface for the browserstack api.

## Installation

```npm install -g browserstack-cli```

## Setup

Run

```browserstack setup```

to create a ~/.browserstack directory and download the `browserstack.jar`, which is used to communicate with the browserstack api. You will be promted for your browserstack 

* username
* password
* [private key](http://www.browserstack.com/local-testing#cmd-tunnel)
* [api key](http://www.browserstack.com/automated-browser-testing-api)

## Overview

Get a list of available browsers:

```browserstack browsers```

Launch firefox 3.6 and point it to google.com:

```browserstack launch firefox:3.6 http://google.com```

Outputs:

```
Launching firefox:3.6...
Worker 514664 was created.
```

The command will use the latest version if none is specified. Launch latest firefox and point it to google.com:

```browserstack launch firefox http://google.com```

List all workers:

```browserstack list```

Kill a worker:

```browserstack kill 514664```

Kill all workers:

```browserstack kill all```


### Attaching to a remote browser

Using the ``--attach`` option keeps the command running. When the command receives a SIGTERM or a SIGINT (CTRL-C) signal, it kills the remote browser before exiting itself.

```browserstack launch --attach firefox:3.6 http://google.com```

## Usage

```
Usage: browserstack [options] [command]

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
```

## ```~/.browserstack.json```

You can configure your browserstack username, password, and tunnel key in the file ```~/.browserstack.json``` like this:

```json
{
  "username": "XXXXXXX",
  "password": "XXXXXXX",
  "privateKey": "XXXXXXX",
  "apiKey": "XXXXXXX"
}
```

Your private key should be listed at http://www.browserstack.com/local-testing#cmd-tunnel and your api key should be listed at http://www.browserstack.com/automated-browser-testing-api.

## Issues, Questions?
To ask a question or report an issue, please open a [github issue](https://github.com/dbrans/browserstack-cli/issues/new).

## CHANGES
0.2.6 Fixed --os parameter. Freeze grunt version.

0.2.5 Added missing BrowserStackTunnel.jar, fixed key parameter

0.2.4 Print full output from 'browsers' command.

0.2.3 Minor fixes: config_file and no-args.

0.2.2 kill workers that match a string: kill iphone, kill android

0.2.1 Kill multiple workers

0.2.0 Added browser-list caching, devices and intelligent defaults

