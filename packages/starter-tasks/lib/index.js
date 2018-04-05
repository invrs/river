export async function starterNode({ path, run }) {
  await run("git", [
    "clone",
    "git@github.com:invrs/node-starter.git",
    path,
  ])

  await run("sh", [
    "-c",
    `
    cd ${path};
    rm -rf .git;
    git init .
    `,
  ])
}
