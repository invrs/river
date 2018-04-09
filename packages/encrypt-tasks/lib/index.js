import "./source.maps"

import { crypt } from "./crypt"
import { readFile } from "./fs"
import { init as initFn } from "./init"

export async function setup(config) {
  config.alias.encrypt = {
    i: ["init"],
  }

  return config
}

export async function encrypt({
  ask,
  config,
  init,
  riverConfig,
  type = "encrypt",
}) {
  await initFn({ ask, config })

  if (init) {
    return
  }

  let dir = await riverConfig.get("river.storeDir")
  let info = await config.get("encryptTasks")

  info.key = await readFile(info.keyPath, "utf8")

  await crypt({ config, dir, info, type })
}

export async function decrypt({ tasks }) {
  await tasks.encrypt({ type: "decrypt" })
}
