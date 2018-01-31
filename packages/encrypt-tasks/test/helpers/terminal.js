import { run } from "commandland"
import { fixtures } from "./fixtures"

export async function runWithSteps(task, steps) {
  let { path, read, write } = await fixtures()
  steps = steps.concat([])

  let onData = ({ out, pty }) => {
    if (steps[0] && out.match(steps[0])) {
      steps.shift()
      pty.write("\r")
    }
  }

  await run(`${path}/run`, [task], {
    onData,
    silent: true,
  })

  return { path, read, steps, write }
}
