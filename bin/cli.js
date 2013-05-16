#! /usr/bin/env node

var program = require('commander')
var BrowserStack = require('browseroverflow')
var cli_util = require('../lib/cli_util')
var exitIfErrorElse = cli_util.exitIfErrorElse
var hangOnTillExit = cli_util.hangOnTillExit
var selectBrowser = BrowserStack.selectBrowser

var display = require('../lib/display')

program.version(require(__dirname + '/../package').version)

program
  .option('-u, --user <user:password>', 'Browserstack authentication')
  .option('-a, --attach', "Attach process to launched browser")
  .option('-o, --os', 'The os of the browser or device. Defaults to "win"')
  .option('-t, --timeout <seconds>', "Launch duration after which browsers exit")
  .option('-p, --private', "Use the private web tunneling key for manual testing")
  .option('-k, --key <key>', "Tunneling key")


program
  .command('setup')
  .description('Initial setup')
  .action(setup)

function setup(){
  makeBS().setup(program)
}

program
  .command('launch <browser> <url>')
  .description('Launch a browser')
  .action(launchBrowser)

function launchBrowser(browserSpec, url){
  var client = makeBS()
  client.browsers(exitIfErrorElse(function(browsers){
    var browser = selectBrowser(browsers, browserSpec)
    if (!browser){
      console.error('No matching browser found for "' + browserSpec + '"')
      return process.exit(1)
    }
    var config = {
      url: url,
      browser: browser.browser,
      device: browser.device,
      os: browser.os,
      os_version: browser.os_version,
      browser_version: browser.browser_version
      //timeout: program.timeout
    }

    client.launch(config, exitIfErrorElse(function(job){
      console.log('Launched job ' + job.id + '.')
      if (program.attach){
        console.log('Ctrl-C to kill job.')
        hangOnTillExit(function(){
          killJob(job.id)
        })
      }
    }))
  }))
}

program
  .command('browsers')
  .description('List available browsers')
  .action(listBrowsers)

function listBrowsers(){
  makeBS().browsers(exitIfErrorElse(function(browsers){
    display.displayBrowsers(browsers)
  }))
}

program
  .command('jobs')
  .description('List active jobs')
  .action(listJobs)

function listJobs(){
  makeBS().jobs(exitIfErrorElse(function(jobs){
    if (jobs.length === 0){
      console.log('No active jobs.')
    }else{
      display.displayJobs(jobs)
    }
  }))
}

program
  .command('kill <job_id>')
  .description('Kill an active job')
  .action(killJob)

function killJob(jobId){
  makeBS().kill(jobId, exitIfErrorElse(function(info){
    console.log('Killed job ' + jobId + ' which ran for ' + 
      Math.round(info.time) + 's.')
  }))
}

program
  .command('killall')
  .description('Kill all active jobs')
  .action(killAllJobs)

function killAllJobs(){
  makeBS().killAllJobs(exitIfErrorElse(function(){
    console.log('Killed all the jobs.')
  }))
}

program
  .command('tunnel <host:port>')
  .description('Setup tunneling')
  .action(makeATunnel)

function makeATunnel(hostAndPort){
  makeBS().tunnel({
    hostAndPort: hostAndPort,
    key: program.key,
    usePrivateKey: program['private']
  }, exitIfErrorElse(function(){
    console.log('Tunnel is running.')
    process.stdin.resume()
  }))
}

program
  .command('status')
  .description('Get the current status')
  .action(getStatus)

function getStatus(){
  makeBS().status(exitIfErrorElse(function(status){
    for (var prop in status){
      console.log(capitalize(prop.replace(/_/g, ' ')) + ': ' + status[prop])
    }
  }))
}

program.parse(process.argv)

if (program.args.length === 0){
  program.outputHelp()
}

function makeBS(){
  return BrowserStack(config())

  function config(){
    if (!program.user) return {}
    var parts = program.user.split(':')
    if (parts.length !== 2){
      console.error('--user option should be in format "user:password"')
      process.exit(1)
    }
    return {
      username: parts[0],
      password: parts[1]
    }
  }
}



