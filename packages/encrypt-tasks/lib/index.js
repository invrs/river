export async function encryptInit({
  ask,
  get,
  jsonDir,
  set,
} = {}) {
  if (get("encryptTasks")) {
    console.warn("encryptTasks already exists")
    return
  }

  let keys = await askForKeys(ask)

  await set("encryptTasks", {
    files: [],
    jsonDirs: [jsonDir],
    ...keys,
  })
}

export async function encrypt() {}

export async function decrypt() {}

async function askForKeys(ask) {
  let defaultKey = "~/.ssh/id_rsa"

  return await ask([
    {
      default: `${defaultKey}.pub`,
      message: "Public key",
      name: "publicKey",
      type: "input",
    },
    {
      default: defaultKey,
      message: "Private key",
      name: "privateKey",
      type: "input",
    },
  ])
}
