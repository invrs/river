# Encrypt Tasks

[Task Env](https://github.com/invrs/task-env#readme) tasks to encrypt/decrypt files or JSON values.

## Install

```bash
npm install --save encrypt-tasks
```

Add `encrypt-tasks` into your `tasks`:

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  jsonDir: __dirname + "/config",
  tasks: [require("encrypt-tasks")],
})
```

See [Task Env docs](https://github.com/invrs/task-env#readme) for more info.

## Initialize

The `encrypt.init` task adds an `encryptTasks` key to your configs:

```bash
./run encrypt.init
```

## Configuration

The `encryptTasks` key contains the following options:

| Field      | Description                                            |
| ---------- | ------------------------------------------------------ |
| `jsonDirs` | Array of directories to look for encrypted JSON fields |
| `files`    | Array of files to encrypt in entirety                  |

### Encrypting JSON values

To encrypt JSON string values, add `<={encrypt}` to the beginning of the string.

## Encrypt

```bash
./run encrypt
```

## Decrypt

```bash
./run decrypt
```
