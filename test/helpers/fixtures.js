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

  let river = await read("river/river.json")
  river.storeDir = path

  await write("river/river.json", river)

  return { path, read, write }
}
