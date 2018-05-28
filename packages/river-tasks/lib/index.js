// Packages
import { homedir } from "os"
import { dirname, join } from "path"

import findUp from "find-up"
import taskEnv from "task-env"

import * as defaultTasks from "default-tasks"
import * as encryptTasks from "encrypt-tasks"
import * as lernaTasks from "lerna-tasks"
import * as npmTasks from "@invrs/npm-tasks"
import * as starterTasks from "starter-tasks"

// Functions
export async function riverTasks(tasks = [], options = {}) {
  const stores = setupStores(options)
  const relative = await relativeTasks()

  return taskEnv({
    args: process.argv.slice(2),
    preSetup: [preSetupStores],
    setup: [setupCwd(relative)],
    stores,
    tasks: [
      defaultTasks,
      encryptTasks,
      lernaTasks,
      npmTasks,
      starterTasks,
      ...relative.tasks,
      ...tasks,
    ],
  })
}

export function configDir(options = {}) {
  return options.configDir || process.env.CONFIG_DIR
}

export async function preSetupStores(config, args) {
  let { riverConfig } = args

  if (config.stores.config) {
    return
  }

  let storeDir = await riverConfig.get("river.storeDir")

  if (configDir() || storeDir) {
    config.stores.config = {
      pattern: "**/*",
      root: configDir() || storeDir,
    }
  } else {
    await setStoreDir(args)
    await preSetupStores(config, args)
  }
}

export function riverConfigDir(options = {}) {
  return (
    options.riverConfigDir ||
    process.env.RIVER_CONFIG_DIR ||
    join(homedir(), ".river")
  )
}

export async function relativeTasks() {
  const riverTasks = await findUp("riverTasks.js")

  if (riverTasks) {
    return {
      cwd: dirname(riverTasks),
      tasks: require(riverTasks),
    }
  } else {
    return { tasks: [] }
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

export function setupCwd({ cwd }) {
  return config => {
    config.parsedArgs.cwd = cwd || process.cwd()
  }
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
