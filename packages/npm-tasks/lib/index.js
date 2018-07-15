import { basename, dirname } from "path"
import { promisify } from "util"

// Packages
import { readJson, writeJson } from "fs-extra"
import glob from "glob"

// Helpers
import { homepage } from "./homepage"

// Tasks
export async function preSetup(config) {
  config.alias.npm = {
    c: ["clean"],
    g: ["globally"],
    i: ["install"],
    l: ["list"],
    p: ["publish"],
    s: ["skipLerna"],
    u: ["update"],
    v: ["version"],
  }

  config.urls.npm = await homepage()
}

export async function npm(options) {
  const { clean, install, list, publish, update } = options

  if (clean) {
    await npmClean(options)
  }

  if (install) {
    await npmInstall(options)
  }

  if (list) {
    await npmList(options)
  }

  if (publish) {
    await npmPublish(options)
  }

  if (update) {
    await npmUpdate(options)
  }
}

// Helpers
async function eachPackage(cwd, fn) {
  const pkgPath = `${cwd}/packages`
  const pkgGlob = `{${pkgPath}/*,${cwd}}/package.json`
  const paths = await promisify(glob)(pkgGlob)

  for (const path of paths) {
    const cwd = dirname(path)
    const base = basename(cwd)
    const pkg = await readJson(path)

    await fn({ base, cwd, path, pkg })
  }
}

async function npmClean({ cwd, run }) {
  const rm = [
    "rm",
    ["-rf", "node_modules", "package-lock.json"],
  ]

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

async function npmPublish({
  cwd,
  env,
  run,
  version = "patch",
}) {
  if (env == "production") {
    version = "minor"
  }

  const { out } = await run(
    "git",
    ["describe", "--always"],
    { cwd }
  )
  const publishRegex = /v\d+\.\d+\.\d+-\d+-[\w\d]+/m

  if (out.match(publishRegex)) {
    return
  }

  const { code } = await run("npm", ["version", version], {
    cwd,
  })

  if (code !== 0) {
    return
  }

  await run("npm", ["publish"], { cwd })
}

async function npmUpdate(options) {
  const {
    cwd,
    skipLerna,
    tasks,
    update,
    version = "latest",
  } = options

  const carat = `^${version}`

  await eachPackage(cwd, async ({ path, pkg }) => {
    if (pkg.dependencies) {
      const dep = pkg.dependencies[update]

      if (dep && dep != carat) {
        pkg.dependencies[update] = carat
      }
    }

    if (pkg.devDependencies) {
      const dev = pkg.devDependencies[update]

      if (dev && dev != carat) {
        pkg.devDependencies[update] = carat
      }
    }

    await writeJson(path, pkg, { spaces: 2 })
  })

  if (!skipLerna) {
    await tasks.lerna({ bootstrap: true, cwd })
  }
}
