// Packages
import { homedir } from "os"
import { join } from "path"

import findUp from "find-up"
import taskEnv from "task-env"

import * as defaultTasks from "default-tasks"
import * as encryptTasks from "encrypt-tasks"
import * as starterTasks from "starter-tasks"

// Constants
const configDir =
  process.env.RIVER_CONFIG_DIR || join(homedir(), ".river")

// Functions
export async function riverTasks(tasks = [], options = {}) {
  let relativeTasks = await taskUp()

  return taskEnv({
    args: process.argv.slice(2),
    preSetup: [preSetup],
    stores: {
      riverConfig: {
        pattern: "**/*",
        root: options.configDir || configDir,
      },
    },
    tasks: [
      defaultTasks,
      encryptTasks,
      starterTasks,
      ...relativeTasks,
      ...tasks,
    ],
  })
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

  let storeDir = await riverConfig.get("river.storeDir")

  if (storeDir) {
    config.stores.config = {
      pattern: "**/*",
      root: storeDir,
    }
  } else {
    await setStoreDir(args)
  }
}

export async function setStoreDir({ ask, riverConfig }) {
  let { storeDir } = await ask([
    {
      default: configDir,
      message: "Where would you like to keep task configs?",
      name: "storeDir",
      type: "input",
    },
  ])

  await riverConfig.merge("river", { storeDir })
}
