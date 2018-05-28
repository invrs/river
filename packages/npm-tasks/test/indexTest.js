import { npm } from "../dist"

test("without parameters", () => {
  expect(typeof npm).toBe("function")
})
