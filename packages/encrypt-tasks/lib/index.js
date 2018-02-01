import { readdir, readFile, writeFile } from "fs"
import { dirname, extname, resolve } from "path"
import { promisify } from "util"

import mkdirp from "mkdirp"

import * as crypt from "./crypt"
import { isObject } from "./object"

const signifier = "<~"
const signifierRegex = /^<~/

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
    let { password } = await askForPass(ask)
    let key = crypt.makeKey(password)

    await promisify(mkdirp)(dirname(privateKey))
    await promisify(writeFile)(privateKey, key, "utf8")
  }
}

export async function encrypt({ get, type = "encrypt" }) {
  let { files, jsonDirs, privateKey } = get("encryptTasks")
  privateKey = await promisify(readFile)(privateKey, "utf8")
  await cryptTask({ files, jsonDirs, privateKey, type })
}

export async function decrypt({ tasks }) {
  await tasks.encrypt({ type: "decrypt" })
}

async function cryptTask({ jsonDirs, privateKey, type }) {
  for (let jsonDir of jsonDirs) {
    let jsonFiles = await promisify(readdir)(jsonDir)

    for (let basename of jsonFiles) {
      if (
        basename.charAt(0) == "." ||
        extname(basename) != ".json"
      ) {
        continue
      }

      let path = resolve(jsonDir, basename)
      let jsonStr = await promisify(readFile)(path, "utf8")
      let obj = JSON.parse(jsonStr)

      cryptValues({ obj, privateKey, type })
    }
  }
}

function cryptValues({ privateKey, obj, type }) {
  for (let key in obj) {
    if (isObject(obj)) {
      cryptValues({ obj: obj[key], privateKey, type })
    } else if (obj[key].match(signifierRegex)) {
      obj[key] =
        signifier +
        crypt[type](privateKey, obj[key].substring(2))
    }
  }
}

async function askForKeys(ask) {
  return await ask([
    {
      default: "~/.inverse/key",
      message: "Private key location",
      name: "privateKey",
      type: "input",
    },
  ])
}

async function askForPass(ask) {
  return await ask([
    {
      message: "Password",
      name: "password",
      type: "password",
    },
  ])
}
