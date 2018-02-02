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
export const signifier = "<~"
export const signifierRegex = /^<~/

export async function crypt({
  jsonDirs,
  privateKey,
  type,
}) {
  for (let jsonDir of jsonDirs) {
    let jsonFiles = await promisify(readdir)(jsonDir)

    for (let basename of jsonFiles) {
      let isHidden = basename.charAt(0) == "."
      let isJson = extname(basename) != ".json"

      if (isHidden || isJson) {
        continue
      }

      let path = resolve(jsonDir, basename)
      let jsonStr = await promisify(readFile)(path, "utf8")
      let obj = JSON.parse(jsonStr)
      let json = cryptValues({ obj, privateKey, type })

      await promisify(writeFile)(path, json, "utf8")
    }
  }
}

export function cryptValues({ privateKey, obj, type }) {
  for (let key in obj) {
    let isObj = isObject(obj[key])
    let isStr = typeof obj[key] == "string"
    if (isObj) {
      cryptValues({ obj: obj[key], privateKey, type })
    } else if (isStr && obj[key].match(signifierRegex)) {
      let fn = type == "en" ? encrypt : decrypt
      obj[key] =
        signifier + fn(privateKey, obj[key].slice(2))
    }
  }
  return JSON.stringify(obj, null, 2)
}

function encrypt(key, text) {
  let iv = randomBytes(16)
  key = Buffer.from(key, "hex")

  let cipher = createCipheriv(algo, key, iv)
  let crypted = iv.toString("hex")

  crypted += cipher.update(text, "utf8", "hex")
  crypted += cipher.final("hex")

  return crypted
}

function decrypt(key, text) {
  let iv = text.slice(0, 32)
  text = text.slice(32)

  key = Buffer.from(key, "hex")
  iv = Buffer.from(iv, "hex")

  let decipher = createDecipheriv(algo, key, iv)
  let dec = decipher.update(text, "hex", "utf8")

  dec += decipher.final("utf8")
  return dec
}

export function makeKey(pass) {
  let sha = createHash("sha256")
  sha.update(pass)

  return sha.digest("hex")
}
