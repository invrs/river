import { homepage } from "./homepage"

// Tasks
export async function preSetup(config) {
  config.alias.lerna = {
    b: ["build"],
    e: ["env"],
    f: ["force"],
    o: ["only"],
    p: ["publish"],
    v: ["version"],
  }

  config.urls.lerna = await homepage()
}

export async function lerna(options) {
  const {
    bootstrap,
    build,
    ignore,
    only,
    publish,
  } = options

  options.args = []

  buildArgs("ignore", ignore, options)
  buildArgs("scope", only, options)

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
function buildArgs(option, value, options) {
  if (value) {
    value = Array.isArray(value) ? value : [value]

    for (let project of value) {
      options.args = options.args.concat([
        "--include-filtered-dependencies",
        `--${option}`,
        project,
      ])
    }
  }
}

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
  version = "patch",
}) {
  if (env == "production") {
    version = "minor"
  }

  force = force ? ["--force-publish", force] : []
  args = ["--cd-version", version, ...args]

  await run(
    "npx",
    ["lerna", "publish", "--yes", ...force, ...args],
    { cwd }
  )
}
