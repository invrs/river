import { join } from "path"

import { readJson } from "fs-extra"

const pkgPath = join(__dirname, "../package.json")

export async function homepage() {
  let pkg = await readJson(pkgPath)
  return pkg.homepage
}
