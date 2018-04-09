import { runWithSteps } from "../../../test/helpers/terminal"

export * from "../../../test/helpers/fixtures"
export * from "../../../test/helpers/terminal"

export async function runWithInit(fixture, task) {
  return await runWithSteps({
    fixture,
    steps: [
      {
        match: /Private key/,
        write: `${fixture.path}/key\r`,
      },
      { match: /Password/, write: "password\r" },
    ],
    task,
  })
}
