import { fixtures } from "./helpers/fixtures"
import { run } from "./helpers/terminal"

const runInit = async () => {
  let { path, read, write } = await fixtures()
  let steps = [/Public key/, /Private key/]

  await run(path, "encrypt.init", ({ out, pty }) => {
    if (steps[0] && out.match(steps[0])) {
      steps.shift()
      pty.write("\r")
    }
  })

  return { path, read, steps, write }
}

test("init questions", async () => {
  let { steps } = await runInit()
  expect(steps.length).toEqual(0)
})

test("init config", async () => {
  let { read } = await runInit()

  let { encryptTasks } = await read(
    "config/encrypt.tasks.json"
  )

  expect(encryptTasks.files).toEqual([])
  expect(typeof encryptTasks.jsonDirs[0]).toBe("string")
  expect(typeof encryptTasks.privateKey).toBe("string")
  expect(typeof encryptTasks.publicKey).toBe("string")
})
