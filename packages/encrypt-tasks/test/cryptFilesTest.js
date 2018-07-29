import { basename } from "path"

import { fixtures, runWithInit } from "./helpers"
import { genIv } from "../lib/cipher"
import { encryptFile, decryptFile } from "../lib/cryptFiles"
import { move } from "../lib/fs"

test.only("init", async () => {
  let fixture = await fixtures(__dirname)

  let { path, read } = await runWithInit(fixture, [
    "encrypt",
    "--init",
  ])

  let iv = genIv()
  let info = await read("encryptTasks.json")
  let localInfo = await read("river/encryptTasks.json")

  info.key = localInfo[`default-${basename(path)}`].key
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
