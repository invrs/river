import chalk from "chalk"

const ignore = ["defaultTask", "setup", "teardown"]

export async function defaultTask({ tasks }, { alias }) {
  let output = "\n"

  for (let task in tasks) {
    if (ignore.includes(task)) {
      continue
    }

    output += chalk.green(task)

    if (alias[task]) {
      for (let key in alias[task]) {
        for (let option of alias[task][key]) {
          output += ` --${option}`
        }
      }
    }

    output += "\n"
  }

  // eslint-disable-next-line no-console
  console.log(output)
}
