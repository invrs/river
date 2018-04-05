import { starterNode } from "../dist"

test("without parameters", () => {
  expect(typeof starterNode).toBe("function")
})
