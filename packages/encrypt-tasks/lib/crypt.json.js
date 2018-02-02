import { randomBytes } from "crypto"
import { readdir, readFile, writeFile } from "fs"
import { extname, resolve } from "path"
import { promisify } from "util"

import { createCipher, createDecipher } from "./cipher"
import { isObject } from "./object"

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

export async function cryptJsonDirs({
  config,
  dirs,
  type,
}) {
  let { jsonDirs } = config

  let promises = jsonDirs.map(async jsonDir => {
    let jsonFiles = await promisify(readdir)(
      resolve(dirs.root, jsonDir)
    )

    let promises = jsonFiles.map(basename =>
      cryptJsonFile({
        basename,
        config,
        dirs,
        jsonDir,
        type,
      })
    )

    return Promise.all(promises)
  })

  return Promise.all(promises)
}

export async function cryptJsonFile({
  basename,
  config,
  dirs,
  jsonDir,
  type,
}) {
  let isHidden = basename.charAt(0) == "."
  let isNotJson = extname(basename) != ".json"

  if (isHidden || isNotJson) {
    return
  }

  let path = resolve(dirs.root, jsonDir, basename)
  let jsonStr = await promisify(readFile)(path, "utf8")
  let iv = randomBytes(16)

  let obj = JSON.parse(jsonStr)
  let json = cryptJsonValues({ config, iv, obj, type })

  if (json) {
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
      let fn = type == "en" ? encryptText : decryptText

      obj[key] = sign + fn({ config, iv, text })
      match = true
    }
  }

  if (match) {
    return JSON.stringify(obj, null, 2)
  }
}

function encryptText({ config, iv, text }) {
  let cipher = createCipher({ config, iv })

  let hex =
    iv.toString("hex") +
    cipher.update(text, "utf8", "hex") +
    cipher.final("hex")

  return hex
}

function decryptText({ config, text }) {
  let iv = Buffer.from(text.slice(0, 32), "hex")
  text = text.slice(32)

  let decipher = createDecipher({ config, iv })

  let hex =
    decipher.update(text, "hex", "utf8") +
    decipher.final("utf8")

  return hex
}
