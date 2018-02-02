import { createHash } from "crypto"

import { cryptFiles } from "./crypt.files"
import { cryptJsonDirs } from "./crypt.json"

export async function crypt({ config, dirs, set, type }) {
  return Promise.all([
    cryptFiles({ config, dirs, set, type }),
    cryptJsonDirs({ config, dirs, type }),
  ])
}

export function makeKey(pass) {
  let sha = createHash("sha256")
  sha.update(pass)

  return sha.digest("hex")
}
