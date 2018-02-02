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
  expect(config.files).toEqual([])
  expect(typeof config.jsonDirs[0]).toBe("string")
  expect(typeof config.privateKey).toBe("string")
})

test("encrypt", async () => {
  let fixture = await fixtures()
  await runInit(fixture)
  await run({ fixture, task: "encrypt" })
})
