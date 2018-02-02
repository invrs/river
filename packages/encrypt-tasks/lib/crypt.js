import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto"

import { readdir, readFile, writeFile } from "fs"
import { extname, resolve } from "path"
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

export async function crypt({ config, set, type }) {
  return Promise.all([cryptJsonDirs({ config, set, type })])
}

export async function cryptJsonDirs({ config, set, type }) {
  let { jsonDirs } = config

  return Promise.all(
    jsonDirs.map(async jsonDir => {
      let jsonFiles = await promisify(readdir)(jsonDir)

      return Promise.all(
        jsonFiles.map(basename =>
          cryptJsonFile({
            basename,
            config,
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
  jsonDir,
  set,
  type,
}) {
  let isHidden = basename.charAt(0) == "."
  let isJson = extname(basename) != ".json"

  if (isHidden || isJson) {
    return
  }

  let path = resolve(jsonDir, basename)
  let jsonStr = await promisify(readFile)(path, "utf8")
  let iv = makeIv({ config, path })

  let obj = JSON.parse(jsonStr)
  let json = cryptJsonValues({ config, iv, obj, type })

  if (json) {
    await promisify(writeFile)(path, json, "utf8")
  }

  if (json && !config.ivs[path]) {
    await set(
      "encryptTasks.ivs",
      { [path]: iv.toString("hex") },
      "merge"
    )
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

export function makeIv({ config, path }) {
  let iv = config.ivs[path]

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
