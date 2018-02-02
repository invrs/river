import { fixtures } from "./helpers/fixtures"
import { run, runWithSteps } from "./helpers/terminal"

async function runInit(fixture) {
  return await runWithSteps({
    fixture,
    steps: [
      {
        match: /Private key/,
        write: `${fixture.path}/key\r`,
      },
      { match: /Password/, write: "password\r" },
    ],
    task: "encrypt.init",
  })
}

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
