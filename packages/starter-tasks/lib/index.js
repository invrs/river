import { dirname, extname, join } from "path"
import { promisify } from "util"

// Packages
import deepMerge from "deepmerge"
import {
  copy,
  pathExists,
  readJson,
  writeJson,
} from "fs-extra"
import glob from "glob"

// Helpers
import { homepage } from "./homepage"

// Constants
const templatesPath = join(__dirname, "../templates")

// Tasks
export async function preSetup(config) {
  config.alias.starter = {
    b: ["branch"],
    p: ["path"],
    r: ["repo"],
    u: ["user"],
  }

  config.urls.starter = await homepage()
}

export async function starter({ cwd }) {
  const starters = await buildStarters()
  const paths = await promisify(glob)(
    cwd + "{/packages/*,}/package.json"
  )

  for (const path of paths) {
    const pkg = await readJson(path)
    const dirPath = dirname(path)

    if (!pkg.starters) {
      continue
    }

    for (const starter of pkg.starters) {
      for (const starterPath in starters[starter]) {
        const targetPath = join(dirPath, starterPath)
        const exists = await pathExists(targetPath)

        if (!exists) {
          continue
        }

        if (extname(targetPath) == ".json") {
          const target = await readJson(targetPath)
          const newTarget = deepMerge(
            target,
            starters[starter][starterPath]
          )

          await writeJson(targetPath, newTarget)
        } else {
          const absStarterPath = join(
            templatesPath,
            starterPath
          )
          await copy(absStarterPath, targetPath)
        }

        // eslint-disable-next-line no-console
        console.log(`${starter} -> ${targetPath}`)
      }
    }
  }
}

// Helpers
async function buildStarters() {
  const paths = await promisify(glob)(
    templatesPath + "/**/*"
  )

  let starters = {}

  for (const path of paths) {
    const relPath = path.slice(templatesPath.length + 1)
    const starter = relPath.match(/^[^/]+/)[0]
    const starterPath = relPath.match(/^[^/]+\/(.+)/)

    if (starterPath) {
      starters[starter] = starters[starter] || {}
      starters[starter][starterPath[1]] = await readJson(
        path
      )
    }
  }

  return starters
}
