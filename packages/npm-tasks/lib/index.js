import { basename, dirname } from "path"
import { promisify } from "util"

// Packages
import { readJson } from "fs-extra"
import glob from "glob"

// Helpers
import { homepage } from "./homepage"

async function eachPackage(cwd, fn) {
  const pkgPath = `${cwd}/packages`
  const pkgGlob = `${pkgPath}/*/package.json`
  const paths = await promisify(glob)(pkgGlob)

  for (const path of paths) {
    const cwd = dirname(path)
    const base = basename(cwd)
    const pkg = await readJson(path)

    await fn({ base, cwd, path, pkg })
  }
}

// Tasks
export async function preSetup(config) {
  config.alias.npm = {
    c: ["clean"],
    g: ["globally"],
    i: ["install"],
    l: ["list"],
    u: ["update"],
    v: ["version"],
  }

  config.urls.npm = await homepage()
}

export async function npm(options) {
  const { clean, install, list, update } = options

  if (clean) {
    await npmClean(options)
  }

  if (install) {
    await npmInstall(options)
  }

  if (list) {
    await npmList(options)
  }

  if (update) {
    await npmUpdate(options)
  }
}

// Helpers
async function npmClean({ cwd, run }) {
  const rm = [
    "rm",
    ["-rf", "node_modules", "package-lock.json"],
  ]

  await run(...rm, { cwd })

  await eachPackage(cwd, async ({ cwd }) => {
    await run(...rm, { cwd })
  })
}

async function npmInstall(options) {
  const { cwd, dev, globally, install, run } = options
  const flag = globally
    ? "-g"
    : dev
      ? "--save-dev"
      : "--save"

  let cmd = ["install", flag]

  if (install !== true) {
    cmd = cmd.concat([install])
  }

  await run("npm", cmd, { cwd })
}

async function npmList(options) {
  const { cwd, list } = options

  // eslint-disable-next-line no-console
  console.log("")

  await eachPackage(cwd, ({ pkg }) => {
    const dep = pkg.dependencies[list]
    const dev = pkg.devDependencies[list]

    if (dep || dev) {
      // eslint-disable-next-line no-console
      console.log(
        pkg.name,
        "-v",
        dep ? dep : dev,
        dep ? "" : "(dev)"
      )
    }
  })

  // eslint-disable-next-line no-console
  console.log("")
}

async function npmUpdate(options) {
  const { cwd, tasks, update, version = "latest" } = options

  await eachPackage(cwd, async ({ cwd, pkg }) => {
    const dep = pkg.dependencies[update]
    const dev = pkg.devDependencies[update]

    if (dep || dev) {
      await tasks.npm({
        cwd,
        dev,
        install: `${update}@${version}`,
        update: false,
      })
    }
  })

  await tasks.lerna({ bootstrap: true })
}
