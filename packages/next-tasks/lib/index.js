import { join } from "path"

// Tasks
export async function preSetup(config) {
  config.alias.next = {
    b: ["build"],
    e: ["env"],
  }
}

export async function next(options) {
  const { build } = options

  if (build) {
    await nextBuild(options)
  }
}

// Helpers
function nextPath(cwd, path) {
  return join(cwd, "packages/next", path)
}

async function nextBuild({ cwd, cloudProject, run }) {
  await run("npm", ["run", "build"], {
    cwd: nextPath(cwd),
    env: {
      ...process.env,
      GCLOUD_PROJECT: cloudProject,
      NODE_ENV: "production",
    },
  })
}
