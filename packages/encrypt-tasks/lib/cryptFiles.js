import {
  createReadStream,
  createWriteStream,
  move,
  relGlob,
} from "./fs"

import {
  createCipher,
  createDecipher,
  genIv,
} from "./cipher"

export const types = {
  decrypt: decryptFile,
  encrypt: encryptFile,
}

export async function cryptFiles({
  config,
  dir,
  info,
  type,
}) {
  let promises = info.files.map(async path => {
    let paths = await relGlob({ dir, path })

    let promises = paths.map(path =>
      cryptFile({ config, dir, info, path, type })
    )

    return Promise.all(promises)
  })

  return Promise.all(promises)
}

export async function cryptFile({
  config,
  dir,
  info,
  path,
  type,
}) {
  let crypt = types[type]
  let relPath = path.replace(dir + "/", "")

  let iv = info.ivs[relPath]
  iv = getIv({ iv, type })

  if (iv) {
    await setIv({ config, iv, relPath, type })
    await crypt({ info, iv, path })
    await move(`${path}.enc`, path, { overwrite: true })
  }
}

export async function encryptFile({ info, iv, path }) {
  let cipher = createCipher({ info, iv })
  let input = createReadStream(path)
  let output = createWriteStream(`${path}.enc`)

  let promise = new Promise((resolve, reject) => {
    output.on("error", e => reject(e))
    output.on("finish", () => resolve())
  })

  input.pipe(cipher).pipe(output)

  return promise
}

export async function decryptFile({ info, iv, path }) {
  let decipher = createDecipher({ info, iv })
  let input = createReadStream(path)
  let output = createWriteStream(`${path}.enc`)

  let promise = new Promise((resolve, reject) => {
    output.on("error", e => reject(e))
    output.on("finish", () => resolve())
  })

  input.pipe(decipher).pipe(output)

  return promise
}

export function getIv({ iv, type }) {
  if (type == "encrypt" && !iv) {
    return genIv()
  }

  if (type == "decrypt" && iv) {
    return Buffer.from(iv, "hex")
  }
}

export async function setIv({ config, iv, relPath, type }) {
  if (type == "encrypt") {
    await config.merge("encryptTasks.ivs", {
      [relPath]: iv.toString("hex"),
    })
  } else {
    let esc = relPath.replace(".", "\\.")
    await config.delete(`encryptTasks.ivs.${esc}`)
  }
}
