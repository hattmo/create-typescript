import inquirer from "inquirer";
import { spawn } from "child_process";
import { promises as fs } from "fs";

export async function start() {
    let dependencies = "";
    let devDependencies = " @types/chai @types/mocha @types/node chai cross-per-env mocha ts-node tslint typescript";
    const answer = await inquirer.prompt(
        [{
            name: "name",
            type: "input",
            message: "What is the app name?",
            validate: (answer) => /^([a-z]|\-)+$/.test(answer),
        }, {
            name: "description",
            type: "input",
            message: "What is the app description?",
        }, {
            name: "type",
            choices: ["CLI", "Library", "Express App", "Standalone React App", "React + Express"],
            type: "list",
            message: "What type of app is this?",
        }]
    ) as {
        name: string,
        description: string,
        type: string
    };

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

    if (answer.type === "CLI") {

    } else if (answer.type === "Library") {

    } else if (answer.type === "Express App") {
        packageJson.bin = "dist/server/bin/main.js";
        packageJson.main = "dist/server/app.js";

        packageJson.scripts.start = "cross-per-env"
        packageJson.scripts["start:production"] = "node --no-warnings dist/server/bin/main.js";
        packageJson.scripts["start:development"] = "nodemon -V dist/server/bin/main.js";

        dependencies += " express"
        devDependencies += " @types/express"
    } else if (answer.type === "Standalone React App") {
        packageJson.scripts.build = "webpack --mode production";
        packageJson.scripts.start = "webpack-dev-server --content-base=dist --inline --watch --hot";

        const clientAnswer = await inquirer.prompt(
            [{
                name: "name",
                type: "input",
                message: "What is the window title?",
                validate: (answer) => /(^[^\t\n\f\/>"'=]+$)/.test(answer),
            }, {
                name: "options",
                type: "checkbox",
                message: "Select optional libraries",
                choices: [{
                    short: "React Router",
                    value: " react-router-dom @types/react-router-dom"
                }]
            }]
        ) as {
            name: string,
            options: string[]
        };

        await copyTemplates(__dirname + "/../templates/client", "./", (filename, text) => {
            if (filename === "webpack.config.js_T") {
                return text.replace(/###name###/, clientAnswer.name);
            } else if (filename === "README.md_T") {
                return text.replace(/###name###/, answer.name).replace(/###description###/, answer.description)
            } else {
                return text;
            }
        });

        devDependencies += " @types/react @types/react-dom html-webpack-plugin react react-dom css-loader style-loader file-loader ts-loader webpack webpack-cli webpack-dev-server"
        devDependencies += clientAnswer.options.join("")
    } else if (answer.type === "React + Express") {

    }

    await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
    console.log(`Installing dev dependencies: npm i -D ${devDependencies}`)
    await promiseExec(`npm i -D ${devDependencies}`);
    if (dependencies) {
        console.log(`Installing core dependencies: npm i ${dependencies}`)
        await promiseExec(`npm i ${dependencies}`);
    }
    const gitAnswer = await inquirer.prompt([{
        name: "gitremote",
        type: "confirm",
        message: "Set git remote?"
    }, {
        name: "remoteurl",
        type: "input",
        message: "What is the remote url?",
        when: (answer: { gitremote: boolean }) => answer.gitremote
    }]) as {
        gitremote: boolean,
        remoteurl: string
    }
    await promiseExec("git init");
    await promiseExec("git add .");
    await promiseExec("git commit -m \"initial commit\"");
    if (gitAnswer.gitremote) {
        await promiseExec(`git remote add origin ${gitAnswer.remoteurl}`);
        await promiseExec('git push -u origin master')
    }

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

export async function copyTemplates(scrPath: string, destpath: string, processTemplate: (filename: string, templateText: string) => string) {
    const files = await fs.readdir(scrPath);
    await Promise.all(files.map((file) => {
        return (async function () {
            const stat = await fs.stat(`${scrPath}/${file}`)
            if (stat.isDirectory()) {
                await fs.mkdir(`${destpath}/${file}`);
                await copyTemplates(`${scrPath}/${file}`, `${destpath}/${file}`, processTemplate);
            } else {
                const contents = (await fs.readFile(`${scrPath}/${file}`)).toString('utf8');
                await fs.writeFile(`${destpath}/${file.replace(/_T/, '')}`, processTemplate(file, contents))
            }
        })()
    }))
}
