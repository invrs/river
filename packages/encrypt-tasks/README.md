# Encrypt Tasks

[Task Env](https://github.com/invrs/task-env#readme) tasks to encrypt/decrypt files or JSON values.

## Install

```bash
npm install --save encrypt-tasks
```

Require `encrypt-tasks` into your `tasks`:

```js
#!/usr/bin/env node

require("task-env")({
  args: process.argv.slice(2),
  root: __dirname,
  tasks: [require("encrypt-tasks")],
})
```

See [Task Env docs](https://github.com/invrs/task-env#readme) for more info.

## Initialize

Run the `encrypt.init` task to set your config:

```bash
./run encrypt.init
```

## Configuration

The init task creates `encryptTasks.json`:

| Field     | Type                      | Description                                                                                            |
| --------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `files`   | `Array.<String>`          | Paths of files to encrypt (relative to `root`, can be glob)                                            |
| `keyPath` | `String`                  | Path to "private key" (password hash)                                                                  |
| `ivs`     | `Object.<String, String>` | [Initialization vectors](https://en.wikipedia.org/wiki/Initialization_vector) for each file in `files` |

### Encrypted JSON values

Prepend string values with `<~` to encrypt them:

```json
{
  "secret": "<~Encrypt this value!"
}
```

Initialization vectors are stored alongside the encrypted JSON value.

## Encrypt

```bash
./run encrypt
```

## Decrypt

```bash
./run decrypt
```
