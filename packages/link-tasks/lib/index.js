import { join } from "path"
import { promisify } from "util"

// Packages
import glob from "glob"
import {
  ensureSymlink,
  pathExists,
  readJson,
  remove,
} from "fs-extra"

// Helpers
import { homepage } from "./homepage"

// Tasks
export async function preSetup(config) {
  config.alias.link = {
    o: ["only"],
    u: ["update"],
  }

  config.urls.link = await homepage()
}

export async function link({ cwd, only, tasks, update }) {
  const globStr =
    cwd +
    (only
      ? `/packages/${only}/node_modules`
      : "{/packages/*,}/node_modules")

  const paths = await promisify(glob)(globStr)
  const { links } = await readJson(`${cwd}/package.json`)

  if (update) {
    for (const link in links) {
      const path = join(cwd, links[link], "package.json")
      const exists = await pathExists(path)

      if (exists) {
        const pkg = await readJson(path)
        await tasks.npm({
          cwd,
          skipLerna: true,
          update: link,
          version: pkg.version,
        })
      }
    }

    await tasks.lerna({ bootstrap: true, cwd })
  }

  for (const path of paths) {
    for (const link in links) {
      if (only && link != only) {
        continue
      }

      const pkgDist = join(path, link)
      const exists = await pathExists(pkgDist)

      if (exists) {
        const linkTo = join(cwd, links[link])

        await remove(pkgDist)
        await ensureSymlink(linkTo, pkgDist)

        // eslint-disable-next-line no-console
        console.log(linkTo, "—>", pkgDist)
      }
    }
  }
}
