import { homepage } from "./homepage"

// Tasks
export async function preSetup(config) {
  config.alias.lerna = {
    b: ["build"],
    e: ["env"],
    f: ["force"],
    p: ["publish"],
    v: ["version"],
  }

  config.urls.lerna = await homepage()
}

export async function lerna(options) {
  const { bootstrap, build, ignore, publish } = options

  options.args = []

  if (ignore) {
    for (let project of ignore) {
      options.args = options.args.concat([
        "--ignore",
        project,
      ])
    }
  }

  if (bootstrap || (!build && !publish)) {
    await lernaBootstrap(options)
  }

  if (build) {
    await lernaBuild(options)
  }

  if (publish) {
    await lernaPublish(options)
  }
}

// Helpers
async function lernaBootstrap({ cwd, run }) {
  await run("npx", ["lerna", "bootstrap"], { cwd })
}

async function lernaBuild({ args, cwd, run }) {
  await run("npx", ["lerna", "run", "build", ...args], {
    cwd,
  })
}

async function lernaPublish({
  args,
  cwd,
  env,
  force,
  run,
  version = "minor",
}) {
  if (env != "production") {
    version = "patch"
  }

  force = force ? ["--force-publish", force] : []
  args = ["--cd-version", version, ...args]

  await run(
    "npx",
    ["lerna", "publish", "--yes", ...force, ...args],
    { cwd }
  )
}
