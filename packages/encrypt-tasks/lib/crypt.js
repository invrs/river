import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto"

import { readdir, readFile } from "fs"
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

export function cryptValues({ privateKey, obj, type }) {
  for (let key in obj) {
    if (isObject(obj)) {
      cryptValues({ obj: obj[key], privateKey, type })
    } else if (obj[key].match(signifierRegex)) {
      let fn = type == "en" ? encrypt : decrypt
      obj[key] =
        signifier + fn(privateKey, obj[key].substring(2))
    }
  }
}

export function encrypt(key, data) {
  let iv = randomBytes(16)
  let plaintext = Buffer.from(data)
  let cipher = createCipheriv(algo, key, iv)
  let ciphertext = cipher.update(plaintext)

  ciphertext = Buffer.concat([
    iv,
    ciphertext,
    cipher.final(),
  ])

  return ciphertext.toString("base64")
}

export function decrypt(key, data) {
  let input = Buffer.from(data)
  let iv = input.slice(0, 16)
  let ciphertext = input.slice(16)
  let decipher = createDecipheriv(algo, key, iv)
  let plaintext = decipher.update(ciphertext)

  plaintext += decipher.final()

  return plaintext
}

export function makeKey(pass) {
  let sha = createHash("sha256")
  sha.update(pass)

  return sha.digest("hex")
}
