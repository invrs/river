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
} = {}) {
  if (get("encryptTasks")) {
    console.warn("encryptTasks already exists")
    return
  }

  let { privateKey } = await askForKeys(ask)
  privateKey = resolve(privateKey)

  await set("encryptTasks", {
    files: [],
    jsonDirs: [jsonDir],
    privateKey,
  })

  try {
    await promisify(readFile)(privateKey, "utf8")
  } catch (e) {
    await writePrivateKey({ ask, privateKey })
  }
}

export async function encrypt({ get, type = "en" }) {
  let { files, jsonDirs, privateKey } = get("encryptTasks")

  privateKey = await promisify(readFile)(privateKey, "utf8")

  await crypt({ files, jsonDirs, privateKey, type })
}

export async function decrypt({ tasks }) {
  await tasks.encrypt({ type: "de" })
}

async function writePrivateKey({ ask, privateKey }) {
  let { password } = await askForPass(ask)
  let key = makeKey(password)

  await promisify(mkdirp)(dirname(privateKey))
  await promisify(writeFile)(privateKey, key, "utf8")
}
