import "./source.maps"

import { readFile, writeKeyPath } from "./fs"
import { resolve } from "path"

import { askForKeys, askForPass } from "./ask"
import { crypt } from "./crypt"

export async function encryptInit({ ask, get, dirs, set }) {
  if (get("encryptTasks")) {
    console.warn("encryptTasks already exists")
    return
  }

  let { keyPath } = await askForKeys(ask)
  keyPath = resolve(keyPath)

  await set("encryptTasks", {
    files: [],
    ivs: {},
    jsonDirs: [dirs.json],
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
  get,
  dirs,
  type = "encrypt",
  set,
}) {
  let config = get("encryptTasks")

  config.key = await readFile(config.keyPath, "utf8")

  await crypt({ config, dirs, set, type })
}

export async function decrypt({ tasks }) {
  await tasks.encrypt({ type: "decrypt" })
}
