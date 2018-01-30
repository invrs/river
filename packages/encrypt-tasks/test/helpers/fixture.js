import { unlink } from "fs"
import { resolve } from "path"
import { promisify } from "util"

export async function reset() {
  let path = resolve(
    __dirname,
    "../fixture/encrypt.tasks.json"
  )
  await promisify(unlink)(path).catch(() => {})
}
