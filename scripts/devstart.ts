import { promises as fs } from "fs";
import { start } from "../src/index";

(async () => {
  try {
    process.stdout.write("Creating testDirectory...\n");
    await fs.mkdir("./testDirectory");
  } catch (err) {
    process.stdout.write("Test directory already exists, clearing directory...\n");
    await clearDirectory("./testDirectory");
  }
  process.stdout.write("Generating test output into ./testDirectory...\n");
  process.chdir("./testDirectory");
  start();
})();

async function clearDirectory(path: string) {
  const files = await fs.readdir(path);
  try {
    await Promise.all(files.map((file) => {
      return (async () => {
        const stat = await fs.stat(`${path}/${file}`);
        if (stat.isDirectory()) {
          await clearDirectory(`${path}/${file}`);
          await fs.rmdir(`${path}/${file}`);
        } else {
          await fs.unlink(`${path}/${file}`);
        }
      })();
    }));
  } catch (err) {
    process.stderr.write("Failed to clear Directory exiting...");
    process.exit(1);
  }
}
