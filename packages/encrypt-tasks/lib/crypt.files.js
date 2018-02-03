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
  dirs,
  set,
  type,
}) {
  let promises = config.files.map(async path => {
    let paths = await relGlob({ dirs, path })

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
  let crypt = types[type]
  let relPath = path.replace(dirs.root + "/", "")

  let iv = config.ivs[relPath]
  iv = getIv({ iv, type })

  if (iv) {
    await setIv({ iv, relPath, set, type })
    await crypt({ config, iv, path })
    await move(`${path}.enc`, path, { overwrite: true })
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

export function getIv({ iv, type }) {
  if (type == "encrypt" && !iv) {
    return genIv()
  }

  if (type == "decrypt" && iv) {
    return Buffer.from(iv, "hex")
  }
}

export async function setIv({ iv, relPath, set, type }) {
  if (type == "encrypt") {
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
