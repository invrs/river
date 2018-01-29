import { task } from "../lib"

test("without parameters", () => {
  expect.assertions(1)
  return expect(task()).resolves.toBe(undefined)
})
