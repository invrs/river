// Packages
import { homedir } from "os"
import { join } from "path"

import findUp from "find-up"
import taskEnv from "task-env"

import * as defaultTasks from "default-tasks"
import * as encryptTasks from "encrypt-tasks"
import * as starterTasks from "starter-tasks"

// Functions
export async function riverTasks(tasks = [], options = {}) {
  const stores = setupStores(options)
  const relativeTasks = await taskUp()

  return taskEnv({
    args: process.argv.slice(2),
    preSetup: [preSetup],
    stores,
    tasks: [
      defaultTasks,
      encryptTasks,
      starterTasks,
      ...relativeTasks,
      ...tasks,
    ],
  })
}

export function configDir(options) {
  return options.configDir || process.env.CONFIG_DIR
}

export function riverConfigDir(options) {
  return (
    options.riverConfigDir ||
    process.env.RIVER_CONFIG_DIR ||
    join(homedir(), ".river")
  )
}

export function setupStores(options) {
  const stores = {
    riverConfig: {
      pattern: "**/*",
      root: riverConfigDir(options),
    },
  }

  if (configDir(options)) {
    return {
      ...stores,
      config: {
        pattern: "**/*",
        root: configDir(options),
      },
    }
  }

  return stores
}

export async function taskUp() {
  const tasksPath = await findUp("riverTasks.js")

  if (tasksPath) {
    return require(tasksPath)
  } else {
    return []
  }
}

export async function preSetup(config, args) {
  let { riverConfig } = args

  if (config.stores.config) {
    return
  }

  let storeDir = await riverConfig.get("river.storeDir")

  if (storeDir) {
    config.stores.config = {
      pattern: "**/*",
      root: storeDir,
    }
  } else {
    await setStoreDir(args)
    await preSetup(config, args)
  }
}

export async function setStoreDir({ ask, riverConfig }) {
  let { storeDir } = await ask([
    {
      message:
        "Where is your version controlled config directory?",
      name: "storeDir",
      type: "input",
    },
  ])

  await riverConfig.merge("river", { storeDir })
}
