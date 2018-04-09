import { resolve } from "path"

import { askForKeys, askForPass } from "./ask"
import { readFile, writeKeyPath } from "./fs"

export async function init({ ask, config }) {
  if (await config.get("encryptTasks")) {
    return
  }

  let { keyPath } = await askForKeys(ask)
  keyPath = resolve(keyPath)

  await config.set("encryptTasks", {
    files: [],
    ivs: {},
    keyPath,
  })

  try {
    await readFile(keyPath, "utf8")
  } catch (e) {
    let { password } = await askForPass(ask)
    await writeKeyPath({ keyPath, password })
  }
}
