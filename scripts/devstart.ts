import { promises as fs } from "fs";
import { start } from "../src/index";
import {promiseExec} from "../src/index";
(async function () {
  try {
    console.log("Creating testDirectory...");
    await fs.mkdir("./testDirectory");
  } catch (err) {
    console.log("testDirectory already exists...");
  }
  await clearDirectory("./testDirectory");
  console.log("Generating test output into ./testDirectory...");
  process.chdir("./testDirectory");
  start();
})();


async function clearDirectory(path: string) {
  const files = await fs.readdir(path);
  await Promise.all(files.map((file) => {
    return (async function () {
      const stat = await fs.stat(`${path}/${file}`)
      if (stat.isDirectory()) {
        await clearDirectory(`${path}/${file}`);
        await fs.rmdir(`${path}/${file}`)
      } else {
        await fs.unlink(`${path}/${file}`);
      }
    })()
  }))
}
