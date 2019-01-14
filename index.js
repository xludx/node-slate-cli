const minimist = require('minimist')

module.exports = () => {
  const args = minimist(process.argv.slice(2))
  const cmd = args._[0]

  switch (cmd) {
    case 'build':
      args.compress = typeof args.compress === 'undefined' ? true : args.compress
      require('./cmds/build')(args)
      break
    case 'serve':
      args.compress = typeof args.compress === 'undefined' ? false : args.compress
      require('./cmds/serve')(args)
      break
    default:
      console.error(`"${cmd}" is not a valid command!`)
      break
  }
}