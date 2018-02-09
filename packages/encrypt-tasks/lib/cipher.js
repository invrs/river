import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto"

export const algo = "aes-256-ctr"

export function createCipher({ info, iv }) {
  let key = cipherKey(info)
  return createCipheriv(algo, key, iv)
}

export function createDecipher({ info, iv }) {
  let key = cipherKey(info)
  return createDecipheriv(algo, key, iv)
}

export function cipherKey(info) {
  return Buffer.from(info.key, "hex")
}

export function genIv() {
  return randomBytes(16)
}

export function extractIv(str) {
  let iv = Buffer.from(str.slice(0, 32), "hex")
  str = str.slice(32)

  return { iv, str }
}

export function makeKey(pass) {
  let sha = createHash("sha256")
  sha.update(pass)

  return sha.digest("hex")
}
