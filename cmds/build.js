const fs = require('fs-extra')
const path = require('path')

const highlight = require('highlight.js')
const marked = require('marked')
const yaml = require('js-yaml')
const CleanCSS = require('clean-css')
const concat = require('concat')
const UglifyJS = require("uglify-js")
const sass = require('sass')
const klaw = require('klaw')
const ejs = require('ejs')
const klawSync = require('klaw-sync')

const renderer = new marked.Renderer()

renderer.code = (code, language) => {
	var highlighted = language
		? highlight.highlight(language, code).value
		: highlight.highlightAuto(code).value
	return '<pre class="highlight ' + language + '"><code>' + highlighted + '</code></pre>'
}

const readIndexYml = () => {
	return {
		...yaml.safeLoad(fs.readFileSync('./node_modules/node-slate-lib/src/index.yml', 'utf8')),
		...(fs.pathExistsSync('./slate-config.yml') ? yaml.safeLoad(fs.readFileSync('./slate-config.yml', 'utf8')) : {}),
	}
}

const getPageData = config => {
	let docs = [];

	if (config.includes && config.includes.length > 0 && fs.pathExistsSync('./src/docs/')) {
		docs = config.includes.map(include => './src/docs/' + include + '.md');
	} else {
		const paths = klawSync('./node_modules/node-slate-lib/src/docs/', {
			traverseAll: false,
			nodir: true,
			filter: item => item.path && item.path.endsWith('.md')
		});
		docs = paths.map(item => item.path);
	}
	console.log('docs: ', JSON.stringify(docs, null, 2));

	let stylesheets = [];
	if (fs.pathExistsSync('./src/docs/css')) {
		const paths = klawSync('./src/docs/css', {
			traverseAll: false,
			nodir: true,
			filter: item => item.path && item.path.endsWith('.css')
		});
		stylesheets = paths.map(item => path.basename(item.path, '.css'));
	}

	const includes = docs
		.map(doc => fs.readFileSync(doc, 'utf8'))
		.map(doc => marked(doc, { renderer: renderer }) )

	return {
		current_page: {
			data: config,
		},
		page_classes: '',
		includes,
		stylesheets,
		image_tag: (filename, alt, className) => '<img alt="' + (alt ? alt : '') + '" class="' + (className ? className : '') + '" src="images/' + filename + '">',
		javascript_include_tag: (name) => '<script src="js/' + name + '.js" type="text/javascript"></script>',
		stylesheet_link_tag: (name, media) => '<link href="css/' + name + '.css" rel="stylesheet" type="text/css" media="' + media + '" />',
		langs: (config.language_tabs || []).map((lang) => typeof lang == 'string' ? lang : lang.keys.first),
	}
};

module.exports = (args) => {
	const config = readIndexYml();

	console.log('config: ' + JSON.stringify(config, null,2));
	var libs = [
		'./node_modules/node-slate-lib/src/js/lib/_energize.js',
		'./node_modules/node-slate-lib/src/js/lib/_jquery.js',
		'./node_modules/node-slate-lib/src/js/lib/_jquery_ui.js',
		'./node_modules/node-slate-lib/src/js/lib/_jquery.tocify.js',
		'./node_modules/node-slate-lib/src/js/lib/_imagesloaded.min.js',
		'./node_modules/node-slate-lib/src/js/app/_lang.js',
		'./node_modules/node-slate-lib/src/js/app/_toc.js',
	];

	if (config.search) {
		libs.push('./node_modules/node-slate-lib/src/js/lib/_lunr.js');
		libs.push('./node_modules/node-slate-lib/src/js/lib/_jquery.highlight.js');
		libs.push('./node_modules/node-slate-lib/src/js/app/_search.js');
	}

	fs.emptyDirSync('./docs');

	fs.copy('./node_modules/node-slate-lib/src/fonts', './docs/fonts')
		.then(() => fs.pathExists('./src/docs/fonts').then(exists => { if (exists) return fs.copy('./src/docs/fonts', './docs/fonts') }))
		.catch(err => { /* noop */ });

	fs.copy('./node_modules/node-slate-lib/src/images', './docs/images')
		.then(() => fs.pathExists('./src/docs/images').then(exists => { if (exists) return fs.copy('./src/docs/images', './docs/images') }))
		.catch(err => { /* noop */ });

	fs.pathExists('./src/docs/css')
		.then(exists => {
			if (exists) return fs.copy('./src/docs/css', './docs/css', { overwrite: true })
		})
		.then(() => {
			var path = './node_modules/highlight.js/styles/' + config.highlight_theme + '.css'
			var newPath = './docs/css/highlight-' + config.highlight_theme + '.css'
			fs.pathExists(path)
				.then(exists => {
					if (exists) {
						return fs.copy(path, newPath)
					}
					return null
				})
				.then(() => {
					if (args.compress) {
						fs.outputFileSync(newPath, new CleanCSS().minify(fs.readFileSync(newPath, 'utf8')).styles)
					}
				})
				.catch(err => { /* noop */ })
		})
		.then(() => {
			klaw('./node_modules/node-slate-lib/src/css', {
				nodir: true,
				filter: item => typeof item == 'string' && item.endsWith('.css.scss')
			})
				.on('data', item => {
					if (item.stats.isDirectory()) return;
					sass.render({file: item.path}, (err, result) => {
						const newFile = item.path.replace(/.+\/(.*)\.scss$/g, '$1');
						fs.outputFileSync('./docs/css/' + newFile, result.css);
						if (args.compress) fs.outputFileSync('./docs/css/' + newFile, new CleanCSS().minify(fs.readFileSync('./docs/css/' + newFile, 'utf8')).styles)
					})
				})
		})
		.catch(err => { /* noop */ })

	// console.log('libs: ', JSON.stringify(libs, null, 2));
	for (const libPath of libs) {
		fs.pathExists(libPath).then(exists => {
			console.log('libPath: ' + libPath + ' ' + exists);
		});
	}
	fs.ensureFile('./docs/js/all.js')
		.then(() => concat(libs, './docs/js/all.js'))
		.then(() => {
			if (args.compress) {
				fs.outputFileSync('./docs/js/all.js', UglifyJS.minify(fs.readFileSync('./docs/js/all.js', 'utf8')).code);
			}
		})
		.catch(err => { /* noop */ });

	var data = getPageData(config);
	fs.copySync('./node_modules/node-slate-lib/src/index.html', './docs/index.html');
	ejs.renderFile('./docs/index.html', data, {}, (err, str) => {
		fs.outputFileSync('./docs/index.html', str)
	})
}
