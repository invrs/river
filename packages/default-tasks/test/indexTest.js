import { defaultTask } from "../dist"

test("without parameters", () => {
  expect(typeof defaultTask).toBe("function")
})
