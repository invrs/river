import { basename, dirname, extname, join } from "path"
import { promisify } from "util"

// Packages
import deepMerge from "deepmerge"
import glob from "glob"

import {
  copy,
  ensureDir,
  ensureFile,
  pathExists,
  readJson,
  writeJson,
} from "fs-extra"

// Helpers
import { homepage } from "./homepage"

// Constants
import { projectTypes } from "./projectTypes"

const cleanInstall = ["basics", "jest/test"]
const templatesPath = join(__dirname, "../templates")

// Tasks
export async function preSetup(config) {
  config.alias.starter = {
    a: ["add"],
    o: ["only"],
    u: ["update"],
  }

  config.urls.starter = await homepage()
}

export async function starter(options) {
  const { add, cwd, only, update } = options

  if (!add && !update) {
    return await askStarter(options)
  }

  const globStr =
    cwd +
    (only
      ? `/packages/${only}/package.json`
      : "{/packages/*,}/package.json")

  const paths = await promisify(glob)(globStr)

  for (const path of paths) {
    const pkg = await readJson(path)
    const dirPath = dirname(path)

    if (add) {
      await addStarter({ add, path, pkg })
    }

    if (update) {
      await mergeStarters({ dirPath, pkg })
    }
  }
}

// Helpers
async function askStarter({ ask, cwd }) {
  const choices = Object.keys(projectTypes)
  const paths = await promisify(glob)(templatesPath + "/*")
  const templates = paths.map(path => basename(path))

  const { name, starters } = await ask([
    {
      choices,
      message: "What kind of project is this?",
      name: "projectType",
      type: "list",
    },
    {
      choices: ({ projectType }) => {
        return templates.map(template => {
          const checked = projectTypes[
            projectType
          ].includes(template)
          return { checked, name: template }
        })
      },
      message:
        "Select starter templates (see https://git.io/fa8FQ)",
      name: "starters",
      type: "checkbox",
    },
    {
      message: "Project name",
      name: "name",
    },
  ])

  const lerna = await pathExists(join(cwd, "packages"))
  const prefixPath = lerna ? `packages/${name}` : name
  const dirPath = join(cwd, prefixPath)
  const pkgPath = join(dirPath, "package.json")
  const pkg = await writePackage({
    name,
    pkgPath,
    starters,
  })

  await mergeStarters({ dirPath, pkg })
}

async function addStarter({ add, path, pkg }) {
  const { starters = [] } = pkg

  if (!Array.isArray(add)) {
    add = [add]
  }

  pkg.starters = [...add, ...starters]
  pkg.starters = pkg.starters.filter(
    (v, i, a) => a.indexOf(v) === i
  )
  pkg.starters = pkg.starters.sort()

  await writeJson(path, pkg, { spaces: 2 })
}

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

function convertTargetPath(targetPath) {
  return targetPath
    .replace(/\/gitignore$/, "/.gitignore")
    .replace(/\/npmignore$/, "/.npmignore")
}

function isCleanInstall(starter, starterPath) {
  const path = join(starter, starterPath)

  for (const clean of cleanInstall) {
    if (clean == path.slice(0, clean.length)) {
      return true
    }
  }
}

async function mergeStarters({ dirPath, pkg }) {
  if (!pkg.starters) {
    return
  }

  const starters = await buildStarters()

  for (const starter of pkg.starters) {
    for (const starterPath in starters[starter]) {
      const targetPath = convertTargetPath(
        join(dirPath, starterPath)
      )
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

async function writePackage({ name, pkgPath, starters }) {
  const exists = await pathExists(pkgPath)
  await ensureFile(pkgPath)
  const pkg = exists ? await readJson(pkgPath) : {}

  pkg.name = name
  pkg.starters = starters

  await writeJson(pkgPath, pkg)

  return pkg
}
