import { promises as fs } from "fs";
import { start } from "../src/index";
import rimraf from "rimraf";
import { promisify } from "util";
let rm = promisify(rimraf);

(async () => {
  try {
    process.stdout.write("Creating testDirectory...\n");
    await fs.mkdir("./testDirectory");
  } catch (err) {
    process.stdout.write(
      "Test directory already exists, clearing directory...\n"
    );
    await rm("./testDirectory/*");
  }
  process.stdout.write("Generating test output into ./testDirectory...\n");
  process.chdir("./testDirectory");
  start();
})();
