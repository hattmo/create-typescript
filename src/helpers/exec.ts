import { spawn } from "child_process";

export default function promiseExec(command: string) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell: true,
      stdio: [process.stdin, process.stdout, process.stderr],
    });
    child.on("exit", () => {
      resolve();
    });
    child.on("error", (err) => {
      reject(err);
    });
  });
}
