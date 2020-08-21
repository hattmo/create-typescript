import { MainAnswers } from "../types";
import copy from "../helpers/copy";
import { join as p } from "path";

export default async (
  answers: MainAnswers,
  packageJson: any,
  dep: string[],
  devDep: string[]
) => {
  packageJson.scripts.test = "jest --coverage";
  devDep.push("@types/jest", "jest", "ts-jest");
  copy(p(__dirname, "../../templates/jest"), process.cwd());
};
