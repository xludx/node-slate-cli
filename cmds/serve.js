const liveServer = require("live-server")
const chokidar = require('chokidar')
const build = require('./build')

module.exports = (args) => {
	build(args)
	
	const watcher = chokidar.watch('./src/docs')
	watcher.on('ready', () => console.log('Initial scan complete. Ready for changes!'))
		.on('all', (event, path) => {
			build(args)
		});

	liveServer.start({
		port: 4567,
		root: './docs',
		open: true
	})
}