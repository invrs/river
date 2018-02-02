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

function encrypt(ivKey, text) {
  let iv = Buffer.from(ivKey.slice(0, 32), "hex")
  let key = Buffer.from(ivKey.slice(32), "hex")

  let cipher = createCipheriv(algo, key, iv)
  let crypted = cipher.update(text, "utf8", "hex")

  crypted += cipher.final("hex")
  return crypted
}

function decrypt(ivKey, text) {
  let iv = Buffer.from(ivKey.slice(0, 32), "hex")
  let key = Buffer.from(ivKey.slice(32), "hex")

  let decipher = createDecipheriv(algo, key, iv)
  let dec = decipher.update(text, "hex", "utf8")

  dec += decipher.final("utf8")
  return dec
}

export function makeKey(pass) {
  let iv = randomBytes(16).toString("hex")

  let sha = createHash("sha256")
  sha.update(pass)

  let key = sha.digest("hex")

  return iv + key
}
