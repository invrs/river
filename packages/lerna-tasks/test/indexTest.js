import { lerna } from "../dist"

test("without parameters", () => {
  expect(typeof lerna).toBe("function")
})
