import { makeKey } from "./cipher"

export async function init({
  ask,
  config,
  ns,
  riverConfig,
}) {
  const encryptConfig = await config.get("encryptTasks")

  const riverEncryptConfig = await riverConfig.get(
    `encryptTasks.${ns}`
  )

  if (!riverEncryptConfig || !riverEncryptConfig.key) {
    let { password } = await askForPass(ask)

    await riverConfig.set(
      `encryptTasks.${ns}.key`,
      makeKey(password)
    )
  }

  if (!encryptConfig) {
    await config.set("encryptTasks", {
      files: [],
      ivs: {},
    })
  }
}

export async function askForPass(ask) {
  return await ask([
    {
      message: "Password",
      name: "password",
      type: "password",
    },
  ])
}
