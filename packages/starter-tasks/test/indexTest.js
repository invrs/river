import { starter } from "../dist"

test("without parameters", () => {
  expect(typeof starter).toBe("function")
})
