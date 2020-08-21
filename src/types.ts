export type job = (
  answers: MainAnswers,
  packageJson: any,
  dep: string[],
  devDep: string[]
) => Promise<void>;

export interface MainAnswers {
  appName: string;
  description: string;
  author: string;
  npmName: string;
  type: "Node" | "Browser";
  express: boolean;
  react: boolean;
  optDeps: Array<{
    dep: string;
    dev: string;
  }>;
  jest: boolean;
  linters: boolean;
  git: boolean;
  gitCreate: boolean;
}
