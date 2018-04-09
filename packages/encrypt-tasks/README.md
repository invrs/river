# Encrypt Tasks

[River tasks](https://github.com/invrs/river#readme) to encrypt/decrypt files or JSON values.

## Install

```bash
npm install -g river-tasks
```

## Encrypted JSON format

Encrypt/decrypt tasks look for encrypted JSON values in the default store.

Prepend string values with `<~` to encrypt them:

```json
{
  "secret": "<~Encrypt this value!"
}
```

## Encrypt

```bash
river encrypt
```

## Decrypt

```bash
river decrypt
```

## Internal config

Running encrypt for the first time creates `encryptTasks.json` in the default store:

| Attribute | Type                      | Description                                                                                            |
| --------- | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `files`   | `Array.<String>`          | Paths of files to encrypt (relative to the default store, can be glob)                                 |
| `keyPath` | `String`                  | Path to "private key" (password hash)                                                                  |
| `ivs`     | `Object.<String, String>` | [Initialization vectors](https://en.wikipedia.org/wiki/Initialization_vector) for each file in `files` |
