const liveServer = require('live-server');
const chokidar = require('chokidar');
const build = require('./build');

module.exports = (args) => {
	build(args);
	const port = args._[1] ? args._[1] : 4567;
	const root = args._[2] ? args._[2] : './docs';

	const watcher = chokidar.watch(['./slate-config.yml', './src/docs']);
	watcher.on('ready', () => console.log('Initial scan complete. Ready for changes!'))
		.on('all', (event, path) => {
			build(args);
		});

	liveServer.start({
		port: port,
		root: root,
		open: true
	});
};
