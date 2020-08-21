import { MainAnswers } from "../types";
import rimraf from "rimraf";
import { join as p } from "path";
import { promisify } from "util";
import copy from "../helpers/copy";

const rm = promisify(rimraf);

export default async (
  answers: MainAnswers,
  packageJson: any,
  dep: string[],
  devDep: string[]
) => {
  dep.push("express");
  devDep.push("@types/express");
  await rm("./src");
  await copy(p(__dirname, "../../templates/express"), process.cwd());
};
