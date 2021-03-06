// Packages
import { homedir } from "os"
import { dirname, join } from "path"

import findUp from "find-up"
import taskEnv from "task-env"

import * as cloudFunctionTasks from "cloud-function-tasks"
import * as defaultTasks from "default-tasks"
import * as encryptTasks from "encrypt-tasks"
import * as lernaTasks from "lerna-tasks"
import * as linkTasks from "link-tasks"
import * as nextTasks from "next-tasks"
import * as npmTasks from "@invrs/npm-tasks"
import * as starterTasks from "starter-tasks"
import * as watchmanTasks from "watchman-tasks"

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
      cloudFunctionTasks,
      defaultTasks,
      encryptTasks,
      lernaTasks,
      linkTasks,
      nextTasks,
      npmTasks,
      starterTasks,
      watchmanTasks,
      ...relative.tasks,
      ...tasks,
    ],
  })
}

export function configDir(options = {}) {
  return options.configDir || process.env.CONFIG_DIR
}

export async function preSetupStores(config) {
  if (config.stores.config) {
    return
  }

  if (configDir()) {
    config.stores.config = {
      pattern: "**/*",
      root: configDir(),
    }
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

export function setupCwd({ cwd }) {
  return config => {
    config.customArgs.cwd = cwd || process.cwd()
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
