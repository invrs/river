import * as cmd from "commandland"

export async function run(path, task, responder) {
  return await terminal(`${path}/run`, [task], responder)
}

export async function terminal(command, args, responder) {
  let { options, pty } = cmd.terminal(command, args, {
    silent: true,
  })

  let out = ""

  return new Promise((resolve, reject) => {
    pty.on("data", data => {
      out += data
      responder({ out, pty })
    })
    pty.on("exit", (code, signal) =>
      resolve({ ...options, code, signal })
    )
    pty.on("error", e => reject(e))
  })
}
