# Starter Tasks

[River tasks](https://github.com/invrs/river#readme) to start projects and update old ones.

## Install

```bash
npm install -g river-tasks
```

## Options

| Flag       | Description         | Default  |
| ---------- | ------------------- | -------- |
| `--branch` | Boilerplate branch  | `master` |
| `--path`   | Path to new project |          |
| `--repo`   | Boilerplate repo    |          |
| `--user`   | Boilerplate user    | `invrs`  |

## Start project

Create a new [node-starter](https://github.com/invrs/node-starter#readme) project:

```bash
river starter -p my-project -r node-starter
```

Use the `-b` option to specify a branch:

```bash
river starter -p my-project -r node-starter -b next
```
