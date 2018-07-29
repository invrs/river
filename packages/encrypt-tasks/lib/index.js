import "./source.maps"

import { basename } from "path"

import { crypt } from "./crypt"
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
  cwd,
  init,
  riverConfig,
  type = "encrypt",
}) {
  const dir = process.env.CONFIG_DIR
  const ns = `${basename(cwd || "default")}-${basename(
    dir
  )}`

  await initFn({ ask, config, ns, riverConfig })

  if (init) {
    return
  }

  const info = await config.get("encryptTasks")
  info.key = await riverConfig.get(`encryptTasks.${ns}.key`)

  await crypt({
    config,
    dir,
    info,
    type,
  })
}

export async function decrypt({ tasks }) {
  await tasks.encrypt({ type: "decrypt" })
}
