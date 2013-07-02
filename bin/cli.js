#!/usr/bin/env node

var browserstack = require('browserstack');
var fs = require('fs');
var path = require('path');
var util = require('util');
var cmd = require('commander');
var async = require('async');
var log = require('winston');
var _ = require('lodash');
var version = '0.3.0';


// ## Command Line Interface
cmd.version(version)
.option('-u, --user <user:password>', 'Browserstack authentication')
.option('--os <os>', 'The OS of the browser. Defaults to Windows:7.')
.option('--device <device>', 'The device of the OS.')
.option('-t, --timeout <seconds>', "Launch duration after which browsers exit.")
.option('--attach', "Attach process to remote browser.")
.option('-k, --key <key>', "Tunneling key.")
.option('--ssl', "ssl flag for tunnel.")
.option('--debug', "Debug mode. More verbose output.");

// ### Command: launch
cmd.command('launch <browser> <url>')
.description('Launch remote browser:version at a url. e.g. browserstack launch firefox:3.6 http://google.com')
.action(setAction(launchAction));

// ### Command: kill
cmd.command('kill <id>')
.description('Kill a running browser. An id of "all" will kill all running browsers')
.action(setAction(killAction));

// ### Command: list
cmd.command('list')
.description('List running browsers')
.action(setAction(listAction));

// ### Command: browsers
cmd.command('browsers')
.description('List available browsers and versions')
.action(setAction(browsersAction));

cmd.command('tunnel <host:port>')
.description('Create a browserstack tunnel')
.action(setAction(tunnelAction));

cmd.command('*')
.action(function(unknown) {
  exitIfError({message: "Unknown command '"+unknown+"'."});
});

cmd.parse(process.argv);

// Show help if no arguments were passed.
if(!cmd.args.length) {
  cmd.outputHelp();
  return;
}

// Init log.
if(!cmd.debug) {
  log.remove(log.transports.Console);
}



// ## Helpers
function extend( a, b ) {
  for ( var p in b ) {
    a[ p ] = b[ p ];
  }
  return a;
}

// Parse a string into a dictionary with the given keys.
function parsePair(str, key1, separator, key2) {
  var arr = str.split(separator);
  var obj = {};
  obj[key1] = arr[0];
  obj[key2] = arr[1];
  return obj;
}

// Parse browser:version into {browser, version}.
//
// Example: parseBrowser("firefox:3.6") produces:
//
// ```
// {browser: "firefox", version: "3.6"}
// ```
function parseBrowser(str) {
  return parsePair(str, "name", ":", "version");
}

function parseOS(str) {
  return parsePair(str, "name", ":", "version");
}

// Parse username:password into {username, password}.
//
// Example: parseBrowser("dougm:fruity777") produces:
//
// ```
// {username: "dougm", password: "fruity777"}
// ```
function parseUser(str) {
  return parsePair(str, "username", ":", "password");
}

function killWorkers(bs, ids, msg) {
  msg = msg || "Killing";
  console.log(msg + ' ' + ids.join(', '));
  async.forEach(ids, bs.terminateWorker.bind(bs), function() {
    console.log('Done.');
  });
}


// ## Config File
// Located at ``~/.browserstack.json``
var CONFIG_FILE = path.join(process.env.HOME, ".browserstack.json");

var config = (function() {
  // Try load a config file from user's home directory
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch(e) {
    return {};
  }
}());



// ## Cache browsers in a local file
// From bruce's node-temp

var cache;
(function() {
  var defaultDirectory = '/tmp';
  var environmentVariables = ['TMPDIR', 'TMP', 'TEMP'];
  var TTL = 1000 * 60 * 60 * 24; // 1 day
  if(action === browsersAction) {
    TTL = 0;
  }

  var getTempDirPath = function() {
    for(var i = 0; i < environmentVariables.length; i++) {
      var value = process.env[environmentVariables[i]];
      if(value)
        return fs.realpathSync(value);
    }
    return fs.realpathSync(defaultDirectory);
  }

  var tempDir = getTempDirPath();
  var cachePath = path.join(tempDir, "browserstack_cache.json");
  log.info('cache path: ' + cachePath);
  // Check if we have a local browsers cache
  if(fs.existsSync(cachePath)) {
    var stat = fs.statSync(cachePath);
    if(stat.mtime > new Date - TTL) {
      try {
        cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        if(cache.version !== version) {
          log.info('Cachefile exists and loaded but old version: ' + cache.version);
          cache = null;
        } else {
          log.info('Cachefile exists and loaded version ' + cache.version);
        }
      }
      catch(e) {
        log.error('Cachefile exists but could not be parsed.');
      }
    } else {
      log.info('Cachefile exists but has expired.');
    }
  }

  function compareVersions(v1, v2) {
    var v1 = v1.split('.').map(parseInt);
    var v2 = v2.split('.').map(parseInt);

    var result = 0;

    v1.some(function(p1, i) {
      var p2 = v2[i] || 0;
      if(p1 !== p2) {
        // We have an answer.
        // Returning non-zero triggers end of "some" iteration.
        return result = (p1 < p2 ? -1 : 1);
      }
    });
    return result ||
      // result is 0. One final check: perhaps v2 is longer and therefore greater.
      (v1.length < v2.length ? -1 : 0);
  }

  var equal = require('assert').equal;

  equal(compareVersions("15.0", "4.0"), 1);

  equal(compareVersions("4.0", "15.0"), -1);

  equal(compareVersions("4", "4.2"), -1);

  equal(compareVersions("4.2", "4"), 1);


  if(!cache) {
    log.info('Fetching browsers.');
    createClient().getBrowsers(function(err, browsers) {
      exitIfError(err);

      log.info('Fetched ' + browsers.length + ' browsers.');
      cache = {
        version: version,
        browsers: browsers
      };
      fs.writeFileSync(cachePath, JSON.stringify(cache))
      runAction();
    });
  } else {
    setTimeout(runAction);
  }
}());

function intelligentDefaults(options) {
  var browsers = _.filter(cache.browsers, options);
  var browser;

  if (browsers.length == 0) {
    exitIfError({message: "No browser found matching: " + JSON.stringify(options) });
  } else if (browsers.length > 1) {
    browser = _(browsers)
      .sortBy('browser_version')
      .first()
      .valueOf();
  } else {
    browser = browsers[0];
  }
}

// ## Actions
// Create a browserstack client.
function createClient(settings) {
  settings = settings || {};
  settings.version = settings.version || 3;

  // Get authentication data
  var auth;

  if(cmd.user) {
    // get auth from commandline
    auth = parseUser(cmd.user);
  } else if(config.username && config.password) {
    // get auth info from config
    auth = {
      username: config.username,
      password: config.password
    };
  } else {
    console.error('Authentication required. Use option "--user" or put a "username" and "password" in ' + CONFIG_FILE);
    process.exit(1);
  }

  return browserstack.createClient(extend(settings, auth));
}


function launchAction(browserVer, url) {

  // Indefinite timeout. We use one day because browserstack cleans up their browsers once a day.
  var FOREVER = 60 * 60 * 24;

  var options = {};
  var browser = parseBrowser(browserVer);
  options.browser = browser.name;
  if (browser.version) {
    options.browser_version = browser.version;
  }

  if(cmd.os) {
    var os = parseOS(cmd.os);
    options.os = os.name;
    options.os_version = os.version;
  }

  if (cmd.device) {
    options.device = cmd.device;
  }

  delete options.name;
  log.info('options:', options);

  intelligentDefaults(options);

  options.url = url;
  options.timeout = cmd.timeout == "0" || cmd.attach ? FOREVER : cmd.timeout || 30;

  var bs = createClient();

  console.log('Launching:\n', options, '...');

  bs.createWorker(options, function(err, worker) {
    exitIfError(err);

    console.log('Worker ' + worker.id + ' was created.');

    if(cmd.attach) {
      attach(function() {
        killWorkers(bs, [worker.id]);
      });
    }
  });
}

// Create a browserstack tunnel.
function createTunnel (key, host, port, ssl) {
  var child_process = require('child_process');

  var tunnel = child_process.spawn('java', ['-jar', __dirname + '/BrowserStackTunnel.jar', key, host+','+port+','+(ssl ? '1' : '0')]);

  tunnel.stdout.on('data', function(data){
    console.log(""+data);
  });

  tunnel.stderr.on('data', function(data) {
    console.log('err: ' + data);
  });

  return tunnel;
}

function tunnelAction(hostPort) {
  var host = parsePair(hostPort, 'name', ':', 'port');
  var key = cmd.key || config.key;
  if(!key) {
    console.error('Browserstack tunnel key required. Use option "--key" or put a "key" in ' + CONFIG_FILE);
    process.exit(1);
  }
  var tunnel = createTunnel(key, host.name, host.port, cmd.ssl);

  tunnel.on('exit', function() {
    process.exit(1);
  });

  attach(function() {
    tunnel.kill('SIGTERM');
  });
}

function browsersAction() {
  for(var name in cache) {
    console.log('')
    var b = cache[name];

  }
  console.log(util.inspect(cache, false, null, false));
}

function killAction(id) {
  // id is a number
  var isNumber = (id == +id);

  var bs = createClient();
  if(isNumber) {

    killWorkers(bs, id.split(','));

  } else {
    bs.getWorkers(function(err, workers) {
      exitIfError(err);

      var msg;
      if (id === "all") {
        msg = 'Killing all workers';
      } else {
        var workers = workers.filter(function(w) {
          return (w.browser || w.device)+w.os.match(new RegExp(id, 'i'));
        });
        msg = 'Killing worker(s) matching ' + JSON.stringify(id);
      }
      if(!workers.length) {
        console.log('No workers or none that match.');
        return;
      }
      killWorkers(bs, workers.map(function(w) {
        return w.id;
      }), msg);
    });
  }
}

function listAction() {
  createClient().getWorkers(function(err, result) {
    exitIfError(err);
    console.log(result);
  });
}


var action;
var actionArgs;

function setAction(f) {
  return function() {
    action = f;
    actionArgs = arguments;
  }
}

function runAction() {
  action.apply(null, actionArgs);
}



// ## Termination

function exitIfError(err) {
  if(err) {
    console.error(err.message);
    process.exit(1);
  }
}

var onExit;

// The cleanup work assigned by a command
function attach(cleanup) {
  // Keep this process alive
  process.stdin.resume();
  onExit = function() {
    // Allow process to die
    process.stdin.pause();
    cleanup();
  };
}

// Try to cleanup before exit
function niceExit() {
  if(onExit) {
    onExit();
    onExit = null;
  }
}

// Handle exiting
process.on('SIGINT', niceExit);
process.on('SIGTERM', niceExit);
process.on('SIGHUP', niceExit);
process.on('exit', niceExit);
