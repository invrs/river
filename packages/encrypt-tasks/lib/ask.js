export async function askForKeys(ask) {
  return await ask([
    {
      default: "~/.inverse/key",
      message: "Private key location",
      name: "privateKey",
      type: "input",
    },
  ])
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
