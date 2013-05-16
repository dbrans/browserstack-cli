exports.hangOnTillExit = hangOnTillExit
function hangOnTillExit(fun){
  process.stdin.resume()
  'SIGINT SIGTERM SIGHUP exit'.split(' ').forEach(function(evt){
    process.on(evt, function(){
      process.stdin.pause()
      fun()
    })
  })
}

exports.exitIfErrorElse = exitIfErrorElse
function exitIfErrorElse(callback){
  return function(err){
    if (err){
      console.error(err.message)
      return process.exit(1)
    }
    var args = Array.prototype.slice.call(arguments, 1)
    callback.apply(this, args)
  }
}
