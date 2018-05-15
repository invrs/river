import { ensureFile, writeFile } from "fs-extra"
import glob from "glob"
import { join } from "path"
import { promisify } from "util"
import { makeKey } from "./cipher"

export * from "fs-extra"

export async function configDir(riverConfig) {
  return (
    process.env.CONFIG_DIR ||
    (await riverConfig.get("river.storeDir"))
  )
}

export async function relGlob({ dir, path }) {
  let abs = join(dir, path)
  return await promisify(glob)(abs)
}

export async function writeKeyPath({ keyPath, password }) {
  let key = makeKey(password)

  await ensureFile(keyPath)
  await writeFile(keyPath, key, "utf8")
}
