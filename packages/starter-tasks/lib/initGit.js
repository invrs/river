export async function initGit({ path, run }) {
  await run("sh", [
    "-c",
    `
    cd ${path};
    rm -rf .git;
    git init .
  `,
  ])
}
