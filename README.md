<p align="center"><i>A CLI for the Node.js port <a href="https://github.com/center-key/node-slate">center-key/node-slate</a> of <a href="https://github.com/lord/slate">lord/slate</a></i></p>

This CLI allows you to use Slate while keeping your documentation and features together in the same branch and repo. To serve the documentation from [Git Pages](https://pages.github.com/), select ```master branch /docs folder``` as your source.

### Installation

```shell
yarn add --dev node-slate-lib
```

### Folder Structure

```shell
.
└── src/
    └── docs/
        ├── css/
        ├── fonts/
        ├── images/
        ├── document1.md
        └── document2.md
```

At compile time, all custom `css`, `fonts`, and `images` will be pulled into the `./docs` directory. All Markdown files will be comibined into the `index.html`.

### Configurations

Place a `slate-config.yml` file in the root of your project. These are the default configurations that you can override:

```yaml
title: API Reference

language_tabs:
  - bash
  - ruby
  - python
  - javascript

toc_footers:
  - <a href='#'>Sign Up for a Developer Key</a>
  - <a href='https://github.com/tripit/slate'>Documentation Powered by Slate</a>

search: true

highlight_theme: monokai

```

### CLI

#### Build

Compile markdown to static site from `./src/docs` to `./docs`:

```shell
slate-cli build
```

| Option | Description |
| :----: |:-----------:|
| --no-compress | Skips uglify steps |

#### Serve

Run a dev server that live-reloads at http://localhost:4567:

```shell
slate-cli serve
```
