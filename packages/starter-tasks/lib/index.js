export async function setup(config) {
  config.alias.starterNode = {
    b: ["branch"],
    p: ["path"],
  }

  return config
}

export async function starterNode({ path, run }) {
  let clone = [
    "clone",
    "git@github.com:invrs/node-starter.git",
    path,
  ]

  await run("git", clone)

  let rmGit = `
    cd ${path};
    rm -rf .git;
    git init .
  `

  await run("sh", ["-c", rmGit])
}
