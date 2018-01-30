import { fixtures } from "./helpers/fixtures"
import { run } from "./helpers/terminal"

describe("init", () => {
  let steps = [/Public key/, /Private key/]

  test("questions", async () => {
    let { path } = await fixtures()
    let step = 0

    await run(path, "encrypt.init", ({ pty, out }) => {
      if (steps[step] && out.match(steps[step])) {
        step += 1
        pty.write("\r")
      }
    })

    expect(step).toBe(2)
  })

  test("config", async () => {
    let { path, read } = await fixtures()

    await run(path, "encrypt.init", ({ pty }) => {
      pty.write("\r")
    })

    let { encryptTasks } = await read(
      "config/encrypt.tasks.json"
    )

    expect(encryptTasks.files).toEqual([])
    expect(typeof encryptTasks.jsonDirs[0]).toBe("string")
    expect(typeof encryptTasks.privateKey).toBe("string")
    expect(typeof encryptTasks.publicKey).toBe("string")
  })
})
