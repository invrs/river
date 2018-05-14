import "./source.maps"

import { crypt } from "./crypt"
import { readFile } from "./fs"
import { homepage } from "./homepage"
import { init as initFn } from "./init"

export async function preSetup(config) {
  config.alias.encrypt = {
    i: ["init"],
  }
  config.urls.encrypt = await homepage()
}

export async function encrypt({
  ask,
  config,
  init,
  riverConfig,
  type = "encrypt",
}) {
  await initFn({ ask, config, riverConfig })

  if (init) {
    return
  }

  let dir = await riverConfig.get("river.storeDir")
  let localInfo = await riverConfig.get("encryptTasks")
  let info = await config.get("encryptTasks")

  info.key = await readFile(localInfo.keyPath, "utf8")

  await crypt({ config, dir, info, type })
}

export async function decrypt({ tasks }) {
  await tasks.encrypt({ type: "decrypt" })
}
