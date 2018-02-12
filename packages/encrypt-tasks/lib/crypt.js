import { cryptConfig } from "./crypt.config"
import { cryptFiles } from "./crypt.files"

export async function crypt({ config, dirs, info, type }) {
  return Promise.all([
    cryptConfig({ config, dirs, info, type }),
    cryptFiles({ config, dirs, info, type }),
  ])
}
