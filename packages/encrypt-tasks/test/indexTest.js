import { basename } from "path"
import { fixtures, run, runWithInit } from "./helpers"

test("init", async () => {
  const fixture = await fixtures(__dirname)
  const { read, steps } = await runWithInit(
    fixture,
    "encrypt"
  )

  const { files, ivs } = await read("encryptTasks.json")
  const localInfo = await read("river/encryptTasks.json")

  const key =
    localInfo[`default-${basename(fixture.path)}`].key

  expect(steps.length).toEqual(0)
  expect(ivs).toEqual({})
  expect(files).toEqual([])
  expect(typeof key).toBe("string")
})

test("encrypt/decrypt JSON", async () => {
  let fixture = await fixtures(__dirname)
  let { read } = await runWithInit(fixture, [
    "encrypt",
    "--init",
  ])

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

test(
  "encrypt/decrypt files",
  async () => {
    let fixture = await fixtures(__dirname)
    let { read, write } = await runWithInit(fixture, [
      "encrypt",
      "--init",
    ])

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
  },
  10000
)
