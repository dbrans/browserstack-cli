browserstack-cli
================

A command line interface for the browserstack api.

## Installation

```npm install -g browserstack-cli```

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

    launch <browser> <url> Launch remote browser:version (e.g. firefox:3.6) at a url.
    kill <id>              Kill a running browser. An id of "all" will kill all running browsers
    list                   List running browsers
    browsers               List available browsers and versions
    tunnel <host:port>     Create a browserstack tunnel
    *

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -u, --user <user:password>  Browserstack authentication
    --os                        The os of the browser or device. Defaults to win.
    -t, --timeout <seconds>     Launch duration after which browsers exit
    --attach                    Attach process to remote browser.
    -k, --key                   Tunneling key.
    --ssl                       ssl flag for tunnel.
```

## ```~/.browserstack.json```

You can configure your browserstack username, password, and tunnel key in the file ```~/.browserstack.json``` like this:

```json
{
  "key": "XXXXXXXXXXXXXXXX",
  "username": "XXXXXXX",
  "password": "XXXXXXX"
}
```

## Your Browserstack Tunnel Key
If you're doing automated testing, use the key from the [automated browser testing page](http://www.browserstack.com/automated-browser-testing-api).

If you're launching browsers manually from the browserstack.com website, use the key from [this page](http://www.browserstack.com/local-testing#cmd-tunnel).

## CHANGES

0.2.2 kill workers that match a string: kill iphone, kill android

0.2.1 Kill multiple workers

0.2.0 Added browser-list caching, devices and intelligent defaults

