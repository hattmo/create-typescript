import { promises as fs } from "fs";
import inquirer from "inquirer";
import path from "path";
import { job, MainAnswers } from "./types";
import exec from "./helpers/exec";
import all from "./jobs/all";
import browser from "./jobs/browser";
import node from "./jobs/node";
import express from "./jobs/express";
import react from "./jobs/react";
import jest from "./jobs/jest";
import git from "./jobs/git";
import linters from "./jobs/linters";
import optDeps from "./optDeps";

export async function start() {
  let dependencies: string[] = [];
  let devDependencies: string[] = [];
  const packageJson: any = {};
  const jobs: job[] = [];

  const answers = (await inquirer.prompt([
    {
      name: "appName",
      type: "input",
      message: "What is the app name?",
      validate: (temp) => /^([a-z]|\-)+$/.test(temp),
      default: path.parse(process.cwd()).base.toLowerCase(),
    },
    {
      name: "description",
      type: "input",
      message: "What is the app description?",
      default: "TODO",
    },
    {
      name: "author",
      type: "input",
      message: "What is the authors name?",
      default: "hattmo",
    },
    {
      name: "npmName",
      type: "input",
      message: "What is the npm username?",
      default: "hattmo",
    },
    {
      name: "type",
      choices: ["Node", "Browser"],
      type: "list",
      message: "What type of app is this?",
      default: "Node",
    },
    {
      name: "express",
      type: "confirm",
      message: "Is this an express app?",
      default: true,
      when: (answers) => answers.type === "Node",
    },
    {
      name: "react",
      type: "confirm",
      message: "Is this an react app?",
      default: true,
      when: (answers) => answers.type === "Browser",
    },
    {
      name: "optDeps",
      type: "checkbox",
      choices: optDeps,
    },
    {
      name: "jest",
      type: "confirm",
      message: "Use jest testing framework?",
      default: true,
    },
    {
      name: "linters",
      type: "confirm",
      message: "Use eslint and prettier linting frameworks?",
      default: true,
    },
    {
      name: "git",
      type: "confirm",
      message: "Initialize git repository?",
      default: true,
    },
    {
      name: "gitCreate",
      type: "confirm",
      message: "Create remote git repository on github?",
      default: true,
      when: (answers) => answers.git,
    },
  ])) as MainAnswers;

  jobs.push(all);

  if (answers.type === "Node") jobs.push(node);
  if (answers.type === "Browser") jobs.push(browser);
  if (answers.express) jobs.push(express);
  if (answers.react) jobs.push(react);
  if (answers.jest) jobs.push(jest);
  if (answers.linters) jobs.push(linters);

  for (let job of jobs) {
    await job(answers, packageJson, dependencies, devDependencies);
  }

  await fs.writeFile("package.json", JSON.stringify(packageJson, null, 2));

  dependencies = dependencies.concat(
    answers.optDeps.filter((opt) => opt.dep !== "").map((opt) => opt.dep)
  );
  devDependencies = devDependencies.concat(
    answers.optDeps.filter((opt) => opt.dev !== "").map((opt) => opt.dev)
  );

  //process.exit(0);
  if (devDependencies.length > 0) {
    process.stdout.write(
      `Installing dev dependencies: npm i -D ${devDependencies.join(" ")}\n`
    );
    await exec(`npm i -D ${devDependencies.join(" ")}`);
  }
  if (dependencies.length > 0) {
    process.stdout.write(
      `Installing core dependencies: npm i ${dependencies.join(" ")}\n`
    );
    await exec(`npm i ${dependencies.join(" ")}`);
  }

  if (answers.git)
    await git(answers, packageJson, dependencies, devDependencies);
}
