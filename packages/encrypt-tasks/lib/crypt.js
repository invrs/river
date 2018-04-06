import { cryptConfig } from "./crypt.config"
import { cryptFiles } from "./crypt.files"

export async function crypt({ config, dir, info, type }) {
  return Promise.all([
    cryptConfig({ config, dir, info, type }),
    cryptFiles({ config, dir, info, type }),
  ])
}
