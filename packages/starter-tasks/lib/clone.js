export async function clone({
  branch,
  path,
  repo,
  run,
  user,
}) {
  await run("git", [
    "clone",
    "-b",
    branch,
    `git@github.com:${user}/${repo}.git`,
    path,
  ])
}
