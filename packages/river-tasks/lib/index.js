import { homedir } from "os"
import { join } from "path"

import taskEnv from "task-env"

import * as defaultTasks from "default-tasks"
import * as encryptTasks from "encrypt-tasks"
import * as starterTasks from "starter-tasks"

const configDir =
  process.env.RIVER_CONFIG_DIR || join(homedir(), ".river")

export async function riverTasks(tasks) {
  return taskEnv({
    args: process.argv.slice(2),
    setup: [setup],
    stores: {
      riverConfig: {
        pattern: "**/*",
        root: configDir,
      },
    },
    tasks: tasks || [
      defaultTasks,
      encryptTasks,
      starterTasks,
    ],
  })
}

async function setup(config, args) {
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

  return config
}

async function setStoreDir({ ask, riverConfig }) {
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
