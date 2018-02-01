import { fixtures } from "./helpers/fixtures"
import { runWithSteps } from "./helpers/terminal"

test("init", async () => {
  let fixture = await fixtures()
  let keyPath = `${fixture.path}/key`

  let { read, steps } = await runWithSteps({
    fixture,
    steps: [
      { match: /Private key/, write: `${keyPath}\r` },
      { match: /Password/, write: "password\r" },
    ],
    task: "encrypt.init",
  })

  let key = await read("key")

  let { encryptTasks } = await read(
    "config/encrypt.tasks.json"
  )

  expect(steps.length).toEqual(0)
  expect(encryptTasks.files).toEqual([])
  expect(typeof key).toBe("string")
  expect(typeof encryptTasks.jsonDirs[0]).toBe("string")
  expect(typeof encryptTasks.privateKey).toBe("string")
})

test("encrypt", async () => {
  let fixture = await fixtures()
  let keyPath = `${fixture.path}/key`

  await runWithSteps({
    fixture,
    steps: [
      { match: /Private key/, write: `${keyPath}\r` },
      { match: /Password/, write: "password\r" },
    ],
    task: "encrypt.init",
  })

  await runWithSteps({
    fixture,
    steps: [],
    task: "encrypt",
  })
})
