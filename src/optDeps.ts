import { MainAnswers } from "./types";

export default [
  {
    name: "React-Router",
    value: {
      dep: "",
      dev: "react-router-dom @types/react-router-dom",
    },
    disabled: (answers: MainAnswers) => !answers.react,
  },
  {
    name: "Helmet",
    value: {
      dep: "helmet",
      dev: "@types/helmet",
    },
    disabled: (answers: MainAnswers) => !answers.express,
  },
  {
    name: "Morgan",
    value: {
      dep: "morgan",
      dev: "@types/morgan",
    },
    disabled: (answers: MainAnswers) => !answers.express,
  },
  {
    name: "Commander",
    value: {
      dep: "commander",
      dev: "@types/commander",
    },
    disabled: (answers: MainAnswers) => answers.type !== "Node",
  },
];
