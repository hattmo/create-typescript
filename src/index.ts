import inquirer from "inquirer";
import { spawn } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";

export async function start() {
    let dependencies = "";
    let devDependecies = " @types/chai @types/mocha @types/node chai concurrently cross-per-env mocha nodemon ts-node tslint typescript";
    const answer = await inquirer.prompt(
        [{
            name: "name",
            type: "input",
            message: "What is the app name?",
            validate: (answer) => /^[a-z]+$/.test(answer),
        }, {
            name: "description",
            type: "input",
            message: "What is the app description?",
        }, {
            name: "clientServer",
            choices: ["CLI", "Front End Library", "Backend Library", "Express App", "Standalone React App", "React + Express"],
            type: "list",
            message: "Is this a Client or Server App?",
        }]
    ) as any;

    //  setup package json
    let packageJson: any = {};
    packageJson.version = "1.0.0";
    packageJson.author = "Hattmo";
    packageJson.license = "GPL-3.0-or-later";
    packageJson.name = "@hattmo/" + answer.name;
    packageJson.description = answer.description;
    packageJson.scripts = {};
    packageJson.scripts["test"] = "cross-per-env";
    packageJson.scripts["test:staging"] = "mocha -r ts-node/register ./test/**/*Test.ts";
    packageJson.scripts["test:development"] = "mocha -r ts-node/register --bail ./test/**/*Test.ts";

    if ((answer.clientServer as any[]).includes('Client')) {
        packageJson.main = "dist/client/public/bundle.js"
        devDependecies += " @types/react @types/react-dom @types/react-router-dom html-webpack-plugin react react-dom react-router-dom css-loader style-loader file-loader ts-loader webpack webpack-cli"
        const clientAnswer = await inquirer.prompt(
            [{
                name: "name",
                type: "input",
                message: "What is the window title?",
                validate: (answer) => /^[a-z]+$/.test(answer),
            }]
        ) as any;
        (await fs.readFile(__dirname + "/../templates/client/webpack.config.js_T")).toString("utf8").replace(/###name###/, clientAnswer.name)
    }
    if ((answer.clientServer as any[]).includes('Server')) {
        packageJson.bin = "dist/server/bin/main.js";
        packageJson.main = "dist/server/app.js";
        packageJson.scripts.start = "cross-per-env"
        packageJson.scripts["start:production"] = "node --no-warnings dist/server/bin/main.js";
        packageJson.scripts["start:development"] = "nodemon -V dist/server/bin/main.js";
        dependencies += " express"
        devDependecies += " @types/express"
    }

    await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
    console.log(`Installing dev dependencies: npm i -D ${devDependecies}`)
    await promiseExec(`npm i -D ${devDependecies}`);
    console.log(`Installing core dependencies: npm i ${dependencies}`)
    await promiseExec(`npm i ${dependencies}`);
    await fs.writeFile(".gitignore", await fs.readFile(__dirname + "/../templates/.gitignore_T"));
}

export function promiseExec(command: string) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, {
            shell: true,
            stdio: [process.stdin, process.stdout, process.stderr]
        });
        child.on("exit", () => {
            resolve();
        });
        child.on("error", (err) => {
            reject(err)
        })
    })
}
