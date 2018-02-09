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

export async function cryptJsonDirs({ dirs, info, type }) {
  let { configDirs } = info

  let promises = configDirs.map(async configDir => {
    let jsonFiles = await readdir(
      resolve(dirs.root, configDir)
    )

    let promises = jsonFiles.map(basename =>
      cryptJsonFile({
        basename,
        configDir,
        dirs,
        info,
        type,
      })
    )

    return Promise.all(promises)
  })

  return Promise.all(promises)
}

export async function cryptJsonFile({
  basename,
  configDir,
  dirs,
  info,
  type,
}) {
  if (isJson(basename)) {
    let path = resolve(dirs.root, configDir, basename)
    let obj = await readJson(path)
    let match = cryptJsonValues({ info, obj, type })

    if (match) {
      await writeJson(path, obj)
    }
  }
}

export function cryptJsonValues({
  info,
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
        info,
        match,
        obj: value,
        type,
      })
    }

    if (is.match) {
      let iv = genIv()
      let text = value.slice(sign.length)

      obj[key] = sign + crypt({ info, iv, text })
      match = true
    }
  }

  return match
}

function encryptText({ info, iv, text }) {
  let cipher = createCipher({ info, iv })

  let hex =
    iv.toString("hex") +
    cipher.update(text, "utf8", "hex") +
    cipher.final("hex")

  return hex
}

function decryptText({ info, text }) {
  let { iv, str } = extractIv(text)
  let decipher = createDecipher({ info, iv })

  let hex =
    decipher.update(str, "hex", "utf8") +
    decipher.final("utf8")

  return hex
}
