export async function askForKeys(ask) {
  return await ask([
    {
      default: `${process.env.HOME}/.inverse/key`,
      message: "Private key location",
      name: "keyPath",
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
