import { reset } from "./helpers/fixture"
import { run } from "./helpers/terminal"

describe("init", () => {
  let steps = [/Public key/, /Private key/]

  test("questions", async () => {
    let step = 0

    await reset()
    await run("encrypt.init", ({ pty, out }) => {
      if (steps[step] && out.match(steps[step])) {
        step += 1
        pty.write("\r")
      }
    })

    expect(step).toBe(2)
  })
})
