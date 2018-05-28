# NPM Tasks

[River tasks](https://github.com/invrs/river#readme) to run npm commands.

## Install

```bash
npm install -g river-tasks
```

## Options

| Flag                                     | Description                                  | Default            |
| ---------------------------------------- | -------------------------------------------- | ------------------ |
| `--clean`                                | Clean `node_modules` and `package-lock.json` |                    |
| `--install=package [--dev] [--globally]` | Install npm package                          |                    |
| `--list=package`                         | List npm packages                            |                    |
| `--update=package [--version]`           | Update npm packages                          | `--version=latest` |
