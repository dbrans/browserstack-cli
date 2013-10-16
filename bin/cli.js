#! /usr/bin/env node

var program = require('commander')
var BrowserStack = require('browseroverflow')
var cli_util = require('../lib/cli_util')
var exitIfErrorElse = cli_util.exitIfErrorElse
var hangOnTillExit = cli_util.hangOnTillExit

var display = require('../lib/display')

program.version(require(__dirname + '/../package').version)

program
  .option('-u, --user <user:password>', 'Browserstack authentication')
  .option('-a, --attach', "Attach process to launched browser")
  .option('-o, --os <name:version>', 'The OS of the browser or device.')
  .option('-t, --timeout <seconds>', "Launch duration after which browsers exit", 30)
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
  var browser = browserSpec.split(':')[0]
  var version = browserSpec.split(':')[1]
  var os_name
  var os_version
  if (program.os){
    var parts = program.os.split(':')
    os_name = parts[0]
    os_version = parts[1]
  }
  makeBS().launch({
    browser: browser,
    browser_version: version,
    os: os_name,
    os_version: os_version,
    url: url
  }, exitIfErrorElse(function(job){
    console.log('Launched job ' + job.id + '.')
    if (program.attach){
      console.log('Ctrl-C to kill job.')
      hangOnTillExit(function(){
        killJob(job.id)
      })
    }
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
  .option('-t, --timeout <seconds>', "Timeout for establishing the tunnel")
  .description('Setup tunneling')
  .action(makeATunnel)

function makeATunnel(hostAndPort){
  var tunnel = makeBS().tunnel({
    hostAndPort: hostAndPort,
    key: program.key,
    usePrivateKey: program['private'],
    timeout: program.timeout * 1000
  }, exitIfErrorElse(function(){
    console.log('Tunnel is running.')
  }))
  hangOnTillExit(function(){
    tunnel.stop()
  })
}

program
  .command('status')
  .description('Get the current status')
  .action(getStatus)

function getStatus(){
  makeBS().status(exitIfErrorElse(function(status){
    for (var prop in status){
      console.log(display.capitalize(prop.replace(/_/g, ' ')) + ': ' + status[prop])
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



