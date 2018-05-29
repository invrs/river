import { dirname } from "path"
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

export async function watchman({ cwd, only, run }) {
  const globStr =
    cwd +
    (only
      ? `/packages/${only}/package.json`
      : "{/packages/*,}/package.json")

  const paths = await promisify(glob)(globStr)

  for (const path of paths) {
    const { watchman } = await readJson(path)

    if (!watchman) {
      continue
    }

    const { triggers } = watchman
    const dirPath = dirname(path)

    for (const trigger of triggers) {
      const payload = ["trigger", dirPath, trigger]

      await run("sh", [
        "-c",
        `watchman  -j <<-EOT\n${JSON.stringify(
          payload
        )}\nEOT`,
      ])
    }
  }
}
