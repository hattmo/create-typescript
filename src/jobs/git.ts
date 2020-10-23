import exec from "../helpers/exec";
import { MainAnswers } from "../types";

export default async (
  answers: MainAnswers,
  packageJson: any,
  dep: string[],
  devDep: string[]
) => {
  await exec("git init");
  await exec("git add .");
  await exec('git commit -m "initial commit"');
  if (answers.gitCreate) {
    await exec("hub create");
    await exec("git push -u origin main");
  }
};
