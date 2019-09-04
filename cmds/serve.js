const liveServer = require('live-server');
const chokidar = require('chokidar');

module.exports = (args) => {
	const port = args._[1] ? args._[1] : 4567;
    const root = args._[2] ? args._[2] : './docs';
    const rebuild = args._[3] ? args._[3] : true;

    if (rebuild === true) {
        const build = require('./build');
        build(args);

        const watcher = chokidar.watch(['./slate-config.yml', './src/docs']);
        watcher.on('ready', () => console.log('Initial scan complete. Ready for changes!'))
            .on('all', (event, path) => {
                build(args);
            });
    }

	liveServer.start({
		port: port,
		root: root,
		open: true
	});

    console.log('docs liveServer started!')
};
