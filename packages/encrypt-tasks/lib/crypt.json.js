import { isJson, readdir, readJson, writeJson } from "./fs"
import { resolve } from "path"

import {
  createCipher,
  createDecipher,
  extractIv,
  genIv,
} from "./cipher"

import { objectIs } from "./object"

export const types = {
  decrypt: {
    crypt: decryptText,
    regex: /^<≈/,
    sign: "<~",
  },
  encrypt: {
    crypt: encryptText,
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
    let jsonFiles = await readdir(
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
  if (isJson(basename)) {
    let path = resolve(dirs.root, jsonDir, basename)
    let obj = await readJson(path)
    let match = cryptJsonValues({ config, obj, type })

    if (match) {
      await writeJson(path, obj)
    }
  }
}

export function cryptJsonValues({
  config,
  match,
  obj,
  type,
}) {
  let { crypt, sign, regex } = types[type]

  for (let key in obj) {
    let value = obj[key]
    let is = objectIs({ regex, value })

    if (is.obj) {
      cryptJsonValues({
        config,
        match,
        obj: value,
        type,
      })
    }

    if (is.match) {
      let iv = genIv()
      let text = value.slice(sign.length)

      obj[key] = sign + crypt({ config, iv, text })
      match = true
    }
  }

  return match
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
  let { iv, str } = extractIv(text)
  let decipher = createDecipher({ config, iv })

  let hex =
    decipher.update(str, "hex", "utf8") +
    decipher.final("utf8")

  return hex
}
