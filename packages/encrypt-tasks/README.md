# Encrypt Tasks

[River tasks](https://github.com/invrs/river#readme) to encrypt/decrypt files or JSON values.

## Install

```bash
npm install -g river-tasks
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
river encrypt
```

## Decrypt

```bash
river decrypt
```
