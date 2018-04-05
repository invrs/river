import { homedir } from "os"
import { join } from "path"

import taskEnv from "task-env"

let configDir = process.env.RIVER_CONFIG_DIR
configDir = configDir || join(homedir(), ".river")

taskEnv({
  alias: {
    b: ["branch"],
    p: ["path"],
  },
  args: process.argv.slice(2),
  setup: [setup],
  stores: {
    riverConfig: {
      pattern: "**/*",
      root: configDir,
    },
  },
  tasks: [
    require("../packages/default-tasks"),
    require("../packages/encrypt-tasks"),
    require("../packages/starter-tasks"),
  ],
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
