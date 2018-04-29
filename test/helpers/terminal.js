import * as cmd from "commandland"

export async function run({ fixture, onData, task }) {
  let { path } = fixture

  if (!Array.isArray(task)) {
    task = [task]
  }

  let out = await cmd.run(`${path}/run`, task, {
    cwd: path,
    onData,
    silent: true,
  })

  // eslint-disable-next-line no-console
  console.log(out.out)

  return { ...fixture, ...out }
}

export async function runWithSteps({
  fixture,
  steps,
  task,
}) {
  steps = steps.concat([])

  let onData = ({ out, pty }) => {
    if (steps[0] && out.match(steps[0].match)) {
      let { write } = steps.shift()
      pty.write(write)
    }
  }

  let out = await run({ fixture, onData, task })

  return { ...out, steps }
}
