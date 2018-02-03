import { writeFile } from "fs-extra"
import glob from "glob"
import mkdirp from "mkdirp"
import { dirname, extname, join } from "path"
import { promisify } from "util"
import { makeKey } from "./cipher"

export * from "fs-extra"

export function isJson(basename) {
  let notHidden = basename.charAt(0) != "."
  let jsonExt = extname(basename) == ".json"

  return notHidden && jsonExt
}

export async function relGlob({ dirs, path }) {
  let abs = join(dirs.root, path)
  return await promisify(glob)(abs)
}

export async function writeKeyPath({ keyPath, password }) {
  let key = makeKey(password)

  await promisify(mkdirp)(dirname(keyPath))
  await writeFile(keyPath, key, "utf8")
}
