import copy from "../helpers/copy";
import { join as p } from "path";
import { MainAnswers } from "../types";

export default async (
  answers: MainAnswers,
  packageJson: any,
  dep: string[],
  devDep: string[]
) => {
  packageJson.scripts.lint = "prettier --write . && eslint src/**";
  devDep.push(
    "eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-google eslint-plugin-react eslint-config-prettier prettier"
  );
  await copy(p(__dirname, "../../templates/linters"), process.cwd());
};
