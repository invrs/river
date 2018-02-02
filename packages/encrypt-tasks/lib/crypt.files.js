import {
  copyFile,
  createReadStream,
  createWriteStream,
  unlink,
} from "fs"

import { randomBytes } from "crypto"
import glob from "glob"
import { join } from "path"
import { promisify } from "util"

import { createCipher, createDecipher } from "./cipher"

export async function cryptFiles({
  config,
  dirs,
  set,
  type,
}) {
  let { files } = config

  let promises = files.map(async relGlob => {
    let absGlob = join(dirs.root, relGlob)
    let paths = await promisify(glob)(absGlob)
    let promises = paths.map(path =>
      cryptFile({ config, dirs, path, set, type })
    )

    return Promise.all(promises)
  })

  return Promise.all(promises)
}

export async function cryptFile({
  config,
  dirs,
  path,
  set,
  type,
}) {
  let relPath = path.replace(dirs.root + "/", "")
  let fn = type == "en" ? encryptFile : decryptFile

  let ok = !config.ivs[relPath] && type == "en"
  ok = ok || (config.ivs[relPath] && type == "de")

  if (ok) {
    let iv = getIv({ config, relPath, type })
    await setIv({ iv, relPath, set, type })
    await fn({ config, iv, path })
    await promisify(copyFile)(`${path}.enc`, path)
    await promisify(unlink)(`${path}.enc`)
  }
}

async function encryptFile({ config, iv, path }) {
  let cipher = createCipher({ config, iv })
  let input = createReadStream(path)
  let output = createWriteStream(`${path}.enc`)

  input.pipe(cipher).pipe(output)

  return new Promise((resolve, reject) => {
    output.on("error", e => reject(e))
    output.on("finish", () => resolve())
  })
}

async function decryptFile({ config, iv, path }) {
  let decipher = createDecipher({ config, iv })
  let input = createReadStream(path)
  let output = createWriteStream(`${path}.enc`)

  input.pipe(decipher).pipe(output)

  return new Promise((resolve, reject) => {
    output.on("error", e => reject(e))
    output.on("finish", () => resolve())
  })
}

export function getIv({ config, relPath, type }) {
  if (type == "en") {
    return randomBytes(16)
  } else {
    let iv = config.ivs[relPath]
    return Buffer.from(iv, "hex")
  }
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
