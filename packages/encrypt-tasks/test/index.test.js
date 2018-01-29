import { encryptInit } from "../lib"

test("without parameters", () => {
  expect.assertions(1)
  return expect(encryptInit()).resolves.toBe(undefined)
})
