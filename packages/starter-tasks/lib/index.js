import { dirname, extname, join } from "path"
import { promisify } from "util"

// Packages
import deepMerge from "deepmerge"
import glob from "glob"

import {
  copy,
  ensureDir,
  pathExists,
  readJson,
  writeJson,
} from "fs-extra"

// Helpers
import { homepage } from "./homepage"

// Constants
const templatesPath = join(__dirname, "../templates")
const cleanInstall = ["basics", "jest/test"]

// Tasks
export async function preSetup(config) {
  config.alias.starter = {
    o: ["only"],
  }

  config.urls.starter = await homepage()
}

export async function starter({ cwd, only }) {
  const starters = await buildStarters()

  const globStr =
    cwd +
    (only
      ? `/packages/${only}/package.json`
      : "{/packages/*,}/package.json")

  const paths = await promisify(glob)(globStr)

  for (const path of paths) {
    const pkg = await readJson(path)
    const dirPath = dirname(path)

    // console.log(path, pkg.starters)

    if (!pkg.starters) {
      continue
    }

    for (const starter of pkg.starters) {
      for (const starterPath in starters[starter]) {
        const targetPath = join(dirPath, starterPath)
        const exists = await pathExists(targetPath)
        const clean = isCleanInstall(starter, starterPath)

        if (clean && exists) {
          continue
        }

        if (extname(targetPath) == ".json" && exists) {
          const target = await readJson(targetPath)
          const dontMerge = (_, source) => source
          const newTarget = deepMerge(
            target,
            starters[starter][starterPath],
            { arrayMerge: dontMerge }
          )

          await writeJson(targetPath, newTarget, {
            spaces: 2,
          })
        } else {
          const absStarterPath = join(
            templatesPath,
            starter,
            starterPath
          )

          await ensureDir(dirname(targetPath))
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
    templatesPath + "/**/*",
    { dot: true, nodir: true }
  )

  let starters = {}

  for (const path of paths) {
    const relPath = path.slice(templatesPath.length + 1)
    const starter = relPath.match(/^[^/]+/)[0]
    const starterPath = relPath.match(/^[^/]+\/(.+)/)

    if (starterPath) {
      starters[starter] = starters[starter] || {}

      const value =
        extname(relPath) == ".json"
          ? await readJson(path)
          : true

      starters[starter][starterPath[1]] = value
    }
  }

  return starters
}

function isCleanInstall(starter, starterPath) {
  const path = join(starter, starterPath)

  for (const clean of cleanInstall) {
    if (clean == path.slice(0, clean.length)) {
      return true
    }
  }
}
