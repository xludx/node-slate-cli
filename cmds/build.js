const fs = require('fs-extra')

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
  var highlighted = language ? highlight.highlight(language, code).value
                             : highlight.highlightAuto(code).value
  return '<pre class="highlight ' + language + '"><code>' + highlighted + '</code></pre>'
}

const readIndexYml = () => {
  return {
		...yaml.safeLoad(fs.readFileSync('./node_modules/node-slate-cli/src/index.yml', 'utf8')), 
		...(fs.pathExistsSync('./slate-config.yml') ? yaml.safeLoad(fs.readFileSync('./slate-config.yml', 'utf8')) : {})
	}
}

const getPageData = config => {
	let docs = []
	if (fs.pathExistsSync('./src/docs')) {
		const paths = klawSync('./src/docs', {
			traverseAll: false, 
			nodir: true, 
			filter: item => item.path && item.path.endsWith('.md')
		})
		docs = paths.map(item => item.path)
	}

	if (docs.length == 0) {
		docs = config.includes.map(include => './node_modules/node-slate-cli/src/' + include + '.md')
	}

  const includes = docs
		.map(doc => fs.readFileSync(doc, 'utf8'))
		.map(doc => marked(doc, { renderer: renderer }) )
				
  return {
    current_page: {
      data: config
    },
    page_classes: '',
    includes: includes,
    image_tag: (filename, alt, className) => '<img alt="' + alt + '" class="' + className + '" src="images/' + filename + '">',
    javascript_include_tag: (name) => '<script src="javascripts/' + name + '.js" type="text/javascript"></script>',
    stylesheet_link_tag: (name, media) => '<link href="css/' + name + '.css" rel="stylesheet" type="text/css" media="' + media + '" />',
    langs: (config.language_tabs || []).map((lang) => typeof lang == 'string' ? lang : lang.keys.first)
  }
}

module.exports = (args) => {
	var config = readIndexYml()
	var data = getPageData(config)

  var libs = [
    './node_modules/node-slate-cli/src/javascripts/lib/_energize.js',
    './node_modules/node-slate-cli/src/javascripts/lib/_jquery.js',
    './node_modules/node-slate-cli/src/javascripts/lib/_jquery_ui.js',
    './node_modules/node-slate-cli/src/javascripts/lib/_jquery.tocify.js',
    './node_modules/node-slate-cli/src/javascripts/lib/_imagesloaded.min.js',
    './node_modules/node-slate-cli/src/javascripts/app/_lang.js',
    './node_modules/node-slate-cli/src/javascripts/app/_toc.js',
	]
  if (config.search) {
    libs.push('./node_modules/node-slate-cli/src/javascripts/lib/_lunr.js')
    libs.push('./node_modules/node-slate-cli/src/javascripts/lib/_jquery.highlight.js')
    libs.push('./node_modules/node-slate-cli/src/javascripts/app/_search.js')
  }

	fs.emptyDirSync('./docs')

	fs.copy('./node_modules/node-slate-cli/src/fonts', './docs/fonts')
		.then(() => fs.pathExists('./src/docs/fonts').then(exists => { if (exists) fs.copy('./src/docs/fonts', './docs/fonts') }))
		.catch(err => console.error(err))

	fs.copy('./node_modules/node-slate-cli/src/images', './docs/images')
		.then(() => fs.pathExists('./src/docs/images').then(exists => { if (exists) fs.copy('./src/docs/images', './docs/images') }))
		.catch(err => console.error(err))

	fs.pathExists('./src/docs/css').then(exists => { if (exists) fs.copy('./src/docs/css', './docs/css') })
	
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

	fs.ensureFile('./docs/javascripts/all.js')
		.then(() => concat(libs, './docs/javascripts/all.js'))
		.then(() => {
			if (args.compress) {
				fs.outputFileSync('./docs/javascripts/all.js', UglifyJS.minify(fs.readFileSync('./docs/javascripts/all.js', 'utf8')).code)
			}
		})

	klaw('./node_modules/node-slate-cli/src/css', {
		nodir: true, 
		filter: item => typeof item == 'string' && item.endsWith('.css.scss') 
	})
  	.on('data', item => {
			if (item.stats.isDirectory()) return
			sass.render({file: item.path}, (err, result) => {
				const newFile = item.path.replace(/.+\/(.*)\.scss$/g, '$1')
				fs.outputFileSync('./docs/css/' + newFile, result.css)
				if (args.compress) fs.outputFileSync('./docs/css/' + newFile, new CleanCSS().minify(fs.readFileSync('./docs/css/' + newFile, 'utf8')).styles)
			})
		})

	fs.copySync('./node_modules/node-slate-cli/src/index.html', './docs/index.html')
	ejs.renderFile('./docs/index.html', data, {}, (err, str) => {
		fs.outputFileSync('./docs/index.html', str)
	})
}