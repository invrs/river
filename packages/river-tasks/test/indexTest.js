import { fixtures } from "../../../test/helpers/fixtures"
import { run } from "../../../test/helpers/terminal"

import { riverTasks } from "../dist"

test("is a function", () => {
  expect(typeof riverTasks).toBe("function")
})

test("without arguments", async () => {
  const fixture = await fixtures(__dirname)
  const { out } = await run({ fixture, task: [] })
  expect(out).toMatch(/testTask/)
})
