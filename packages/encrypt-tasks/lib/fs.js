import glob from "glob"
import { join } from "path"
import { promisify } from "util"

export * from "fs-extra"

export async function relGlob({ dir, path }) {
  let abs = join(dir, path)
  return await promisify(glob)(abs)
}
