<p align="center"><i>A CLI for the Node.js port <a href="https://github.com/sdelements/node-slate">sdelements/node-slate</a> of <a href="https://github.com/lord/slate">lord/slate</a></i></p>

This CLI allows you to use Slate while keeping your documentation and features together in the same branch and repo. To serve the documentation from [Git Pages](https://pages.github.com/), select ```master branch /docs folder``` as your source.

### Installation

```shell
yarn add --dev node-slate-cli
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
