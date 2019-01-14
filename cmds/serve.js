const liveServer = require("live-server")
const chokidar = require('chokidar')
const build = require('./build')

module.exports = (args) => {
	chokidar.watch('./src/docs', {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
		build(args)
	});

	liveServer.start({
		port: 4567,
		root: './docs',
		open: true
	})
}