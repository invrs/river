import { fixtures } from "./helpers/fixtures"
import { run } from "./helpers/terminal"

let getSteps = () => [/Public key/, /Private key/]

test("init questions", async () => {
  let { path } = await fixtures()
  let steps = getSteps()

  await run(path, "encrypt.init", ({ out, pty }) => {
    if (steps[0] && out.match(steps[0])) {
      steps.shift()
      pty.write("\r")
    }
  })

  expect(steps.length).toEqual(0)
})

test("init config", async () => {
  let { path, read } = await fixtures()
  let steps = getSteps()

  await run(path, "encrypt.init", ({ out, pty }) => {
    if (steps[0] && out.match(steps[0])) {
      steps.shift()
      pty.write("\r")
    }
  })

  let { encryptTasks } = await read(
    "config/encrypt.tasks.json"
  )

  expect(encryptTasks.files).toEqual([])
  expect(typeof encryptTasks.jsonDirs[0]).toBe("string")
  expect(typeof encryptTasks.privateKey).toBe("string")
  expect(typeof encryptTasks.publicKey).toBe("string")
})
