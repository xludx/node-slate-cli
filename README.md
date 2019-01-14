<p align="center"><i>A CLI for the Node.js port <a href="https://github.com/sdelements/node-slate">sdelements/node-slate</a> of <a href="https://github.com/lord/slate">lord/slate</a></i></p>

This CLI allows you to use Slate while keeping your documentation and features together in the same branch and repo. To serve the documentation from [https://pages.github.com/](Git Pages), select ```master branch /docs folder``` as your source.

### Installation

```shell
yarn add --dev node-slate-cli
```

### Commands

Compile documentation to static site from `./src/docs` to `./docs`:

```shell
node-slate build
```

Run a dev server that live-reloads at http://localhost:4567:

```shell
node-slate serve
```

