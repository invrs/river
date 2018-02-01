import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto"

const algo = "aes-256-ctr"

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
