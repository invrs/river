// Packages
import {
  copy,
  pathExists,
  readJson,
  writeFile,
  writeJson,
} from "fs-extra"

// Helpers
import { join } from "path"

// Tasks
export async function preSetup(config) {
  config.alias.cloudFunctions = {
    b: ["build"],
    d: ["deploy"],
    e: ["env"],
  }
}

export async function cloudFunctions(options) {
  let { build, cwd, deploy, run } = options

  if (build) {
    await run("npm", ["run", "build"], {
      cwd: cloudFnPath(cwd),
    })
    await buildCloudFunctions(options)
  }

  if (deploy) {
    await deployCloudFunctions(options)
  }
}

// Helpers
function cloudFnPath(cwd, path = "") {
  return join(cwd, "packages/cloud-functions", path)
}

function cloudFnDistPath(cwd, path = "") {
  return join(cwd, "packages/cloud-functions/dist", path)
}

function nextPath(cwd, path = "") {
  return join(cwd, "packages/next", path)
}

async function buildCloudFunctions({ cwd, npmrc }) {
  const hasNext = await pathExists(nextPath(cwd))

  await buildPackage(cwd)

  if (hasNext) {
    await copy(
      nextPath(cwd, "routes.js"),
      cloudFnDistPath(cwd, "routes.js")
    )
  }

  if (npmrc) {
    await writeFile(cloudFnDistPath(cwd, ".npmrc"), npmrc)
  }
}

async function buildPackage(cwd) {
  const pkg = await readJson(
    cloudFnPath(cwd, "package.json")
  )

  pkg.name = pkg.name + "-dist"
  pkg.main = "index.js"
  pkg.private = true

  await writeJson(
    cloudFnDistPath(cwd, "package.json"),
    pkg,
    {
      spaces: 2,
    }
  )
}

async function deployCloudFunctions({ cwd, env, run }) {
  let args = ["--project", env]

  await run(
    "npx",
    [
      "firebase",
      "deploy",
      "--only",
      "hosting,functions",
      ...args,
    ],
    { cwd: cloudFnPath(cwd) }
  )
}
