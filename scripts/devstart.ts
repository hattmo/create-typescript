import { promises as fs } from "fs";
import { start } from "../src/index";

(async function () {
  try {
    console.log("Creating temp directory...");
    await fs.mkdir("./temp");
  } catch (err) {
    console.log("Temp directory already exists...");
  }
  const files = await fs.readdir("./temp")
  files.forEach((item)=>fs.unlink(`./temp/${item}`)));
  console.log("Generating test output into ./temp...");
  process.chdir("./temp");
  start();
})();
