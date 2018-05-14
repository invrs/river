import { resolve } from "path"

import { askForKeys, askForPass } from "./ask"
import { readFile, writeKeyPath } from "./fs"

export async function init({ ask, config, riverConfig }) {
  const encryptConfig = await config.get("encryptTasks")
  const riverEncryptConfig = await riverConfig.get(
    "encryptTasks"
  )

  if (!riverEncryptConfig || !riverEncryptConfig.keyPath) {
    let { keyPath } = await askForKeys(ask)
    keyPath = resolve(keyPath)

    try {
      await readFile(keyPath, "utf8")
    } catch (e) {
      let { password } = await askForPass(ask)
      await writeKeyPath({ keyPath, password })
    }

    await riverConfig.set("encryptTasks", {
      keyPath,
    })
  }

  if (!encryptConfig) {
    await config.set("encryptTasks", {
      files: [],
      ivs: {},
    })
  }
}
