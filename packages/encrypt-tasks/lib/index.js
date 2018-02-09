import "./source.maps"

import { readFile, writeKeyPath } from "./fs"
import { resolve } from "path"

import { askForKeys, askForPass } from "./ask"
import { crypt } from "./crypt"

export async function encryptInit({ ask, config, dirs }) {
  if (config.get("encryptTasks")) {
    console.warn("encryptTasks already exists")
    return
  }

  let { keyPath } = await askForKeys(ask)
  keyPath = resolve(keyPath)

  await config.set("encryptTasks", {
    configDirs: [dirs.config],
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

export async function encrypt({
  config,
  dirs,
  type = "encrypt",
}) {
  let info = config.get("encryptTasks")
  info.key = await readFile(info.keyPath, "utf8")

  await crypt({ config, dirs, info, type })
}

export async function decrypt({ tasks }) {
  await tasks.encrypt({ type: "decrypt" })
}
