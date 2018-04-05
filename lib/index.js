import { homedir } from "os"
import { join } from "path"

import taskEnv from "task-env"

import * as defaultTasks from "default-tasks"
import * as encryptTasks from "encrypt-tasks"
import * as starterTasks from "starter-tasks"

let configDir = process.env.RIVER_CONFIG_DIR
configDir = configDir || join(homedir(), ".river")

taskEnv({
  args: process.argv.slice(2),
  setup: [setup],
  stores: {
    riverConfig: {
      pattern: "**/*",
      root: configDir,
    },
  },
  tasks: [defaultTasks, encryptTasks, starterTasks],
}).catch(console.error)

async function setup(config, args) {
  let { riverConfig } = args

  let storeDir = await riverConfig.get("river.storeDir")

  if (storeDir) {
    config.stores.config = {
      pattern: "**/*",
      root: storeDir,
    }
  } else {
    setStoreDir(args)
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
