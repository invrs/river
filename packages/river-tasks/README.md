# River Tasks

The core of [River](https://github.com/invrs/river#readme). Uses [Task Env](https://github.com/invrs/task-env#readme) to expose tasks and sets up the local and default stores.

## Install

```bash
npm install -g river-tasks
```

## Stores

River exposes two stores: `riverConfig` and `config`. These are referred to as your "local" and "default" stores, respectively. The default store is meant to be version controlled, the local store is not.

The path for the local store defaults to `~/.river`, but can be changed with the `RIVER_CONFIG_DIR` environmental variable.

When you run river for the first time, it asks where you would like to keep your default store. It keeps this path in `riverConfig` and automatically sets up the default `config` store based on this directory every time you run river.
