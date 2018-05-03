import { clone } from "./clone"
import { homepage } from "./homepage"
import { initGit } from "./initGit"

export async function preSetup(config) {
  config.alias.starter = {
    b: ["branch"],
    p: ["path"],
    r: ["repo"],
    u: ["user"],
  }

  config.urls.starter = await homepage()
}

export async function starter({
  branch = "master",
  path,
  repo,
  run,
  user = "invrs",
}) {
  await clone({ branch, path, repo, run, user })
  await initGit({ path, run })
}
