import { runWithSteps } from "./helpers/terminal"

let initSteps = [/Public key/, /Private key/]

test("init questions", async () => {
  let { steps } = await runWithSteps(
    "encrypt.init",
    initSteps
  )
  expect(steps.length).toEqual(0)
})

test("init config", async () => {
  let { read } = await runWithSteps(
    "encrypt.init",
    initSteps
  )

  let { encryptTasks } = await read(
    "config/encrypt.tasks.json"
  )

  expect(encryptTasks.files).toEqual([])
  expect(typeof encryptTasks.jsonDirs[0]).toBe("string")
  expect(typeof encryptTasks.privateKey).toBe("string")
  expect(typeof encryptTasks.publicKey).toBe("string")
})
