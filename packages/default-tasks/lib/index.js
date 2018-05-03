import chalk from "chalk"

import { homepage } from "./homepage"

const ignore = [
  "defaultTask",
  "preSetup",
  "setup",
  "teardown",
]

export async function preSetup(config) {
  config.urls.defaultTask = await homepage()
}

export async function defaultTask({ tasks }, { alias }) {
  let output = "\n"
  let taskNames = Object.keys(tasks).sort()

  for (let task of taskNames) {
    if (ignore.includes(task)) {
      continue
    }

    output += chalk.green(task)

    if (alias[task]) {
      for (let key in alias[task]) {
        let options = alias[task][key].sort()
        for (let option of options) {
          output += ` --${option}`
        }
      }
    }

    output += "\n"
  }

  // eslint-disable-next-line no-console
  console.log(output)
}
