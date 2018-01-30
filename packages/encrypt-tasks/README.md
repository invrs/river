# Encrypt Tasks

[Task Env](https://github.com/invrs/task-env#readme) tasks to encrypt/decrypt files or JSON values.

## Install

```bash
npm install --save encrypt-tasks
```

Add `encrypt-tasks` into your Task Env `tasks`:

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

The `encrypt.init` task creates `encrypt.tasks.json` in your `jsonDir`:

```bash
./run encrypt.init
```

## Configuration

The `encryptTasks` namespace defines what to encrypt:

| Field        | Type             | Description                                     |
| ------------ | ---------------- | ----------------------------------------------- |
| `files`      | `Array.<String>` | Files to encrypt                                |
| `jsonDirs`   | `Array.<String>` | Directories to search for encrypted JSON values |
| `publicKey`  | `String`         | Path to RSA public key                          |
| `privateKey` | `String`         | Path to RSA private key                         |

### Encrypted JSON values

Prepend string values with `<~` to encrypt them:

```json
{
  "secret": "<~Encrypt this value!"
}
```

## Encrypt

```bash
./run encrypt
```

## Decrypt

```bash
./run decrypt
```
