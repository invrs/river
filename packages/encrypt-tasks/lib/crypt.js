import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto"

import {
  copyFile,
  createReadStream,
  createWriteStream,
  readdir,
  readFile,
  writeFile,
} from "fs"
import { extname, join, resolve } from "path"
import { promisify } from "util"

import glob from "glob"

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
    cryptFiles({ config, dirs, set, type }),
    cryptJsonDirs({ config, dirs, type }),
  ])
}

export async function cryptFiles({
  config,
  dirs,
  set,
  type,
}) {
  let { files } = config

  return Promise.all(
    files.map(async relGlob => {
      let absGlob = join(dirs.root, relGlob)
      let paths = await promisify(glob)(absGlob)

      return Promise.all(
        paths.map(path =>
          cryptFile({ config, dirs, path, set, type })
        )
      )
    })
  )
}

export async function cryptFile({
  config,
  dirs,
  path,
  set,
  type,
}) {
  let relPath = path.replace(dirs.root + "/", "")
  let iv = getIv({ config, relPath, type })
  let fn = type == "en" ? encryptFile : decryptFile

  await setIv({ iv, relPath, set, type })
  await fn({ config, iv, path })
  await promisify(copyFile)(`${path}.enc`, path)
}

export async function cryptJsonDirs({
  config,
  dirs,
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
  type,
}) {
  let isHidden = basename.charAt(0) == "."
  let isJson = extname(basename) != ".json"

  if (isHidden || isJson) {
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

async function encryptFile({ config, iv, path }) {
  let key = Buffer.from(config.key, "hex")
  let cipher = createCipheriv(algo, key, iv)

  let input = createReadStream(path)
  let output = createWriteStream(`${path}.enc`)

  input.pipe(cipher).pipe(output)

  return new Promise((resolve, reject) => {
    output.on("error", e => reject(e))
    output.on("finish", () => resolve())
  })
}

async function decryptFile({ config, iv, path }) {
  let key = Buffer.from(config.key, "hex")
  let decipher = createDecipheriv(algo, key, iv)

  let input = createReadStream(path)
  let output = createWriteStream(`${path}.enc`)

  input.pipe(decipher).pipe(output)

  return new Promise((resolve, reject) => {
    output.on("error", e => reject(e))
    output.on("finish", () => resolve())
  })
}

function encryptText({ config, iv, text }) {
  let key = Buffer.from(config.key, "hex")
  let cipher = createCipheriv(algo, key, iv)

  let hex =
    iv.toString("hex") +
    cipher.update(text, "utf8", "hex") +
    cipher.final("hex")

  return hex
}

function decryptText({ config, text }) {
  let key = Buffer.from(config.key, "hex")

  let iv = Buffer.from(text.slice(0, 32), "hex")
  text = text.slice(32)

  let decipher = createDecipheriv(algo, key, iv)

  let hex =
    decipher.update(text, "hex", "utf8") +
    decipher.final("utf8")

  return hex
}

export function getIv({ config, relPath, type }) {
  if (type == "en") {
    return randomBytes(16)
  } else {
    let iv = config.ivs[relPath]
    return Buffer.from(iv, "hex")
  }
}

export function makeKey(pass) {
  let sha = createHash("sha256")
  sha.update(pass)

  return sha.digest("hex")
}

export async function setIv({ iv, relPath, set, type }) {
  if (type == "en") {
    await set(
      "encryptTasks.ivs",
      { [relPath]: iv.toString("hex") },
      "merge"
    )
  } else {
    let esc = relPath.replace(".", "\\.")
    await set(
      `encryptTasks.ivs.${esc}`,
      undefined,
      "delete"
    )
  }
}
