# Default Tasks

[River](https://github.com/invrs/river#readme) default task.

## Install

```bash
npm install -g river
```

## How it works

Define argument options for your task by exporting a `setup` function in your task package:

```bash
export async function setup(config) {
  config.alias.myTask = {
    p: ["path"]
  }

  return config
}

export async function myTask({ path }) {
  // do something
}
```

## List tasks

List each task and its options:

```bash
river
```
