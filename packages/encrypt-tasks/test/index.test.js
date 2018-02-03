import { fixtures } from "./helpers/fixtures"
import { run, runInit } from "./helpers/terminal"

test("init", async () => {
  let fixture = await fixtures()
  let { read, steps } = await runInit(fixture)

  let key = await read("key")
  expect(typeof key).toBe("string")

  let { encryptTasks: config } = await read(
    "config/encrypt.tasks.json"
  )

  expect(steps.length).toEqual(0)
  expect(config.ivs).toEqual({})
  expect(config.files).toEqual([])
  expect(typeof config.jsonDirs[0]).toBe("string")
  expect(typeof config.keyPath).toBe("string")
})

test("encrypt/decrypt JSON", async () => {
  let fixture = await fixtures()
  let { read, write } = await runInit(fixture)

  write("config/secret.json", {
    secret: "<~Encrypt this value!",
  })

  for (let i = 0; i < 2; i++) {
    await run({ fixture, task: "encrypt" })

    let { secret: encrypted } = await read(
      "config/secret.json"
    )
    expect(encrypted.length).toBe(72)
  }

  for (let i = 0; i < 2; i++) {
    await run({ fixture, task: "decrypt" })

    let { secret: decrypted } = await read(
      "config/secret.json"
    )
    expect(decrypted).toBe("<~Encrypt this value!")
  }
})

test("encrypt/decrypt files", async () => {
  let fixture = await fixtures()
  let { read, write } = await runInit(fixture)

  let config = await read("config/encrypt.tasks.json")
  config.encryptTasks.files = ["encrypt.txt"]

  await write("config/encrypt.tasks.json", config)

  for (let i = 0; i < 2; i++) {
    await run({ fixture, task: "encrypt" })

    config = await read("config/encrypt.tasks.json")

    expect(
      config.encryptTasks.ivs["encrypt.txt"].length
    ).toBe(32)

    let encrypt = await read("encrypt.txt")
    expect(encrypt).not.toBe("Encrypt me!\n")
  }

  for (let i = 0; i < 2; i++) {
    await run({ fixture, task: "decrypt" })

    config = await read("config/encrypt.tasks.json")

    expect(
      config.encryptTasks.ivs["encrypt.txt"]
    ).toBeUndefined()

    let decrypt = await read("encrypt.txt")
    expect(decrypt).toBe("Encrypt me!\n")
  }
})
