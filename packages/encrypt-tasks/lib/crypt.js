import { cryptConfig } from "./cryptConfig"
import { cryptFiles } from "./cryptFiles"

export async function crypt({ config, dir, info, type }) {
  return Promise.all([
    cryptConfig({ config, dir, info, type }),
    cryptFiles({ config, dir, info, type }),
  ])
}
