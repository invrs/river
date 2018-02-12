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

export async function cryptConfig({
  config,
  dirs,
  keys = [],
  info,
  obj,
  type,
}) {
  let { crypt, sign, regex } = types[type]

  obj = obj || config.obj

  for (let key in obj) {
    let value = obj[key]
    let is = objectIs({ regex, value })
    let newKeys = keys.concat([key])

    if (is.match) {
      let iv = genIv()
      let text = value.slice(sign.length)
      config = await config.set(
        newKeys,
        sign + crypt({ info, iv, text })
      )
    }

    if (is.obj) {
      await cryptConfig({
        config,
        dirs,
        info,
        keys: newKeys,
        obj: value,
        type,
      })
    }
  }
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
