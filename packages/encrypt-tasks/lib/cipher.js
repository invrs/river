import { createCipheriv, createDecipheriv } from "crypto"

export const algo = "aes-256-ctr"

export function createCipher({ config, iv }) {
  let key = cipherKey(config)
  return createCipheriv(algo, key, iv)
}

export function createDecipher({ config, iv }) {
  let key = cipherKey(config)
  return createDecipheriv(algo, key, iv)
}

export function cipherKey(config) {
  return Buffer.from(config.key, "hex")
}
