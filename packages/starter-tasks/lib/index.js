import { join } from "path"
import { readJson } from "fs-extra"

const pkgPath = join(__dirname, "../package.json")

export async function setup(config) {
  let pkg = await readJson(pkgPath)

  config.alias.starterNode = {
    b: ["branch"],
    p: ["path"],
    r: ["repo"],
    u: ["user"],
  }

  config.urls.starter = pkg.homepage

  return config
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

async function clone({ branch, path, repo, run, user }) {
  await run("git", [
    "clone",
    "-b",
    branch,
    `git@github.com:${user}/${repo}.git`,
    path,
  ])
}

async function initGit({ path, run }) {
  await run("sh", [
    "-c",
    `
    cd ${path};
    rm -rf .git;
    git init .
  `,
  ])
}
