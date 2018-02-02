import { readFile, writeFile } from "fs"
import { dirname, resolve } from "path"
import { promisify } from "util"

import mkdirp from "mkdirp"

import { askForKeys, askForPass } from "./ask"
import { crypt, makeKey } from "./crypt"

export async function encryptInit({
  ask,
  get,
  jsonDir,
  set,
}) {
  if (get("encryptTasks")) {
    console.warn("encryptTasks already exists")
    return
  }

  let { keyPath } = await askForKeys(ask)
  keyPath = resolve(keyPath)

  await set("encryptTasks", {
    files: [],
    ivs: {},
    jsonDirs: [jsonDir],
    keyPath,
  })

  try {
    await promisify(readFile)(keyPath, "utf8")
  } catch (e) {
    await writeKeyPath({ ask, keyPath })
  }
}

export async function encrypt({ get, type = "en", set }) {
  let config = get("encryptTasks")

  config.key = await promisify(readFile)(
    config.keyPath,
    "utf8"
  )

  await crypt({ config, set, type })
}

export async function decrypt({ tasks }) {
  await tasks.encrypt({ type: "de" })
}

async function writeKeyPath({ ask, keyPath }) {
  let { password } = await askForPass(ask)
  let key = makeKey(password)

  await promisify(mkdirp)(dirname(keyPath))
  await promisify(writeFile)(keyPath, key, "utf8")
}
