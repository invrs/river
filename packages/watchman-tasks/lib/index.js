import { promisify } from "util"

// Packages
import glob from "glob"
import { readJson } from "fs-extra"

// Helpers
import { homepage } from "./homepage"

// Tasks
export async function preSetup(config) {
  config.alias.watchman = {
    o: ["only"],
  }

  config.urls.watchman = await homepage()
}

export async function watchman({ cwd, only }) {
  const globStr =
    cwd +
    (only
      ? `/packages/${only}/package.json`
      : "{/packages/*,}/package.json")

  const paths = await promisify(glob)(globStr)

  for (const path of paths) {
    const pkg = await readJson(path)
    // const dirPath = dirname(path)

    if (!pkg.watchman) {
      continue
    }

    // console.log(pkg.watchman)
  }
}
