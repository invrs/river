import { riverTasks } from "../dist"

test("without parameters", () => {
  expect(typeof riverTasks).toBe("function")
})
