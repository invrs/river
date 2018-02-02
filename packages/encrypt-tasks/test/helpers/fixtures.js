import { resolve } from "path"
import * as fxtr from "fxtr"

export async function fixtures() {
  let { path, read, write } = await fxtr.fixtures(
    __dirname,
    "../fixtures"
  )
  let run = await read("run")

  run = run.replace(
    "../../dist",
    resolve(__dirname, "../../dist")
  )

  run = run.replace(
    "task-env",
    resolve(__dirname, "../../node_modules/task-env/dist")
  )

  await write("run", run)

  return { path, read, write }
}
