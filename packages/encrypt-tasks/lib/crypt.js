import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto"

import { readdir, readFile, writeFile } from "fs"
import { extname, join, resolve } from "path"
import { promisify } from "util"

import { isObject } from "./object"

export const algo = "aes-256-ctr"
export const jsonValueSign = {
  de: {
    regex: /^<≈/,
    sign: "<~",
  },
  en: {
    regex: /^<~/,
    sign: "<≈",
  },
}

export async function crypt({ config, dirs, set, type }) {
  return Promise.all([
    cryptJsonDirs({ config, dirs, set, type }),
  ])
}

export async function cryptJsonDirs({
  config,
  dirs,
  set,
  type,
}) {
  let { jsonDirs } = config

  return Promise.all(
    jsonDirs.map(async jsonDir => {
      let jsonFiles = await promisify(readdir)(
        resolve(dirs.root, jsonDir)
      )

      return Promise.all(
        jsonFiles.map(basename =>
          cryptJsonFile({
            basename,
            config,
            dirs,
            jsonDir,
            set,
            type,
          })
        )
      )
    })
  )
}

export async function cryptJsonFile({
  basename,
  config,
  dirs,
  jsonDir,
  set,
  type,
}) {
  let isHidden = basename.charAt(0) == "."
  let isJson = extname(basename) != ".json"

  if (isHidden || isJson) {
    return
  }

  let path = resolve(dirs.root, jsonDir, basename)
  let relPath = join(jsonDir, basename)

  let jsonStr = await promisify(readFile)(path, "utf8")
  let iv = makeIv({ config, relPath })

  let obj = JSON.parse(jsonStr)
  let json = cryptJsonValues({ config, iv, obj, type })

  if (json) {
    await setIv({ config, iv, relPath, set })
    await promisify(writeFile)(path, json, "utf8")
  }
}

export function cryptJsonValues({
  config,
  iv,
  match,
  obj,
  type,
}) {
  let { sign, regex } = jsonValueSign[type]

  for (let key in obj) {
    let isObj = isObject(obj[key])
    let isStr = typeof obj[key] == "string"

    if (isObj) {
      cryptJsonValues({
        config,
        iv,
        match,
        obj: obj[key],
        type,
      })
    }

    if (isStr && obj[key].match(regex)) {
      let text = obj[key].slice(sign.length)
      let fn = type == "en" ? encrypt : decrypt

      obj[key] = sign + fn({ config, iv, text })
      match = true
    }
  }

  if (match) {
    return JSON.stringify(obj, null, 2)
  }
}

function encrypt({ config, iv, text }) {
  let key = Buffer.from(config.key, "hex")
  let cipher = createCipheriv(algo, key, iv)

  let hex =
    cipher.update(text, "utf8", "hex") + cipher.final("hex")

  return hex
}

function decrypt({ config, iv, text }) {
  let key = Buffer.from(config.key, "hex")
  let decipher = createDecipheriv(algo, key, iv)

  let hex =
    decipher.update(text, "hex", "utf8") +
    decipher.final("utf8")

  return hex
}

export function makeIv({ config, relPath }) {
  let iv = config.ivs[relPath]

  if (iv) {
    return Buffer.from(iv, "hex")
  }

  return randomBytes(16)
}

export function makeKey(pass) {
  let sha = createHash("sha256")
  sha.update(pass)

  return sha.digest("hex")
}

export async function setIv({ config, iv, relPath, set }) {
  if (config.ivs[relPath]) {
    return
  }

  await set(
    "encryptTasks.ivs",
    { [relPath]: iv.toString("hex") },
    "merge"
  )
}
