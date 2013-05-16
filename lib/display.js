var Table = require('cli-table')

exports.displayBrowsers = displayBrowsers
function displayBrowsers(browsers){
  var table = new Table({
    head: ['Browser', 'Device', 'OS'],
    colWidth: [100, 100, 100]
  })
  browsers.forEach(function(browser){
    table.push([
      browserDisplay(browser),
      deviceDisplay(browser),
      osDisplay(browser)
    ])
  })
  console.log(table.toString())  
}

exports.displayJobs = displayJobs
function displayJobs(jobs){
  var table = new Table({
    head: ['ID', 'Browser/Device', 'OS', 'Status'],
    colWidth: [100, 100, 100]
  })
  jobs.forEach(function(job){
    table.push([
      job.id,
      job.browser ? browserDisplay(job) : deviceDisplay(job),
      osDisplay(job),
      job.status
    ])
  })
  console.log(table.toString())
}

function browserDisplay(browser){
  var ret = browser.browser
  if (browser.browser_version){
    ret += ' (' + browser.browser_version + ')'
  }
  return ret
}

function osDisplay(browser){
  return browser.os + ' (' + browser.os_version + ')'
}

function deviceDisplay(browser){
  return browser.device || 'NA'
}

function capitalize(str){
  return str.substring(0, 1).toUpperCase() + str.substring(1)
}