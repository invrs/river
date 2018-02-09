import { cryptFiles } from "./crypt.files"
import { cryptJsonDirs } from "./crypt.json"

export async function crypt({ config, dirs, info, type }) {
  return Promise.all([
    cryptFiles({ config, dirs, info, type }),
    cryptJsonDirs({ dirs, info, type }),
  ])
}
