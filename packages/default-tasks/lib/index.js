import { join } from "path"

import chalk from "chalk"
import { readJson } from "fs-extra"

const ignore = ["defaultTask", "setup", "teardown"]
const pkgPath = join(__dirname, "../../../package.json")

export async function setup(config) {
  let pkg = await readJson(pkgPath)
  config.urls.defaultTask = pkg.homepage
  return config
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
