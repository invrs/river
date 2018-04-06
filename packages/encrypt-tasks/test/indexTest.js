import { fixtures, run, runInit } from "./helpers"

test("init", async () => {
  let fixture = await fixtures(__dirname)
  let { read, steps } = await runInit(fixture)

  let key = await read("key")
  expect(typeof key).toBe("string")

  let { files, keyPath, ivs } = await read(
    "encryptTasks.json"
  )

  expect(steps.length).toEqual(0)
  expect(ivs).toEqual({})
  expect(files).toEqual([])
  expect(typeof keyPath).toBe("string")
})

test("encrypt/decrypt JSON", async () => {
  let fixture = await fixtures(__dirname)
  let { read, write } = await runInit(fixture)

  write("secret.json", {
    secret: "<~Encrypt this value!",
  })

  for (let i = 0; i < 2; i++) {
    await run({ fixture, task: "encrypt" })

    let { secret: encrypted } = await read("secret.json")
    expect(encrypted.length).toBe(72)
  }

  for (let i = 0; i < 2; i++) {
    await run({ fixture, task: "decrypt" })

    let { secret: decrypted } = await read("secret.json")
    expect(decrypted).toBe("<~Encrypt this value!")
  }
})

test("encrypt/decrypt files", async () => {
  let fixture = await fixtures(__dirname)
  let { read, write } = await runInit(fixture)

  let config = await read("encryptTasks.json")
  config.files = ["encrypt.txt"]

  await write("encryptTasks.json", config)

  for (let i = 0; i < 2; i++) {
    await run({ fixture, task: "encrypt" })

    config = await read("encryptTasks.json")

    expect(config.ivs["encrypt.txt"].length).toBe(32)

    let encrypt = await read("encrypt.txt")
    expect(encrypt).not.toBe("Encrypt me!\n")
  }

  for (let i = 0; i < 2; i++) {
    await run({ fixture, task: "decrypt" })

    config = await read("encryptTasks.json")

    expect(config.ivs["encrypt.txt"]).toBeUndefined()

    let decrypt = await read("encrypt.txt")
    expect(decrypt).toBe("Encrypt me!\n")
  }
})
