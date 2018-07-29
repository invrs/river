import { resolve } from "path"
import * as fxtr from "fxtr"

export async function fixtures(dirname) {
  let { path, read, write } = await fxtr.fixtures(
    dirname,
    "./fixtures"
  )
  let run = await read("run")

  run = run.replace(
    "../../dist",
    resolve(dirname, "../dist")
  )

  run = run.replace(
    "task-env",
    resolve(dirname, "../node_modules/task-env/dist")
  )

  await write("run", run)

  return { path, read, write }
}
