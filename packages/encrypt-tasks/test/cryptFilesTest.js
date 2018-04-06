import { fixtures, runInit } from "./helpers"

import { genIv } from "../lib/cipher"
import {
  encryptFile,
  decryptFile,
} from "../lib/crypt.files"
import { move } from "../lib/fs"

test("init", async () => {
  let fixture = await fixtures(__dirname)
  let { path, read } = await runInit(fixture)

  let iv = genIv()
  let key = await read("key")
  let info = await read("encryptTasks.json")

  info.key = key
  path += "/encrypt.txt"

  await encryptFile({ info, iv, path })
  await move(`${path}.enc`, path, { overwrite: true })

  expect(await read("encrypt.txt")).not.toBe(
    "Encrypt me!\n"
  )

  await decryptFile({ info, iv, path })
  await move(`${path}.enc`, path, { overwrite: true })

  expect(await read("encrypt.txt")).toBe("Encrypt me!\n")
})
