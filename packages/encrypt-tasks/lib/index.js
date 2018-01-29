export async function encryptInit({ jsonDir, set } = {}) {
  if (jsonDir) {
    await set("encryptTasks.jsonDirs", [jsonDir])
    await set("encryptTasks.files", [])
  }
}
