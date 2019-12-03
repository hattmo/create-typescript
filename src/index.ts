import { spawn } from "child_process";
import { promises as fs } from "fs";
import inquirer from "inquirer";

export async function start() {
    let dependencies = "";
    let devDependencies = "@types/chai @types/mocha @types/node chai mocha ts-node tslint typescript";
    const answer = await inquirer.prompt(
        [{
            name: "name",
            type: "input",
            message: "What is the app name?",
            validate: (temp) => /^([a-z]|\-)+$/.test(temp),
        }, {
            name: "description",
            type: "input",
            message: "What is the app description?",
        }, {
            name: "author",
            type: "input",
            message: "What is the authors name?",
        }, {
            name: "npmName",
            type: "input",
            message: "What is the npm username?",
        }, {
            name: "type",
            choices: ["CLI", "Library", "Express App", "Standalone React App", "React + Express"],
            type: "list",
            message: "What type of app is this?",
        }],
    ) as {
        name: string,
        description: string,
        author: string,
        npmName: string,
        type: string,
    };

    const packageJson: any = {};
    packageJson.version = "1.0.0";
    packageJson.author = answer.author;
    packageJson.license = "GPL-3.0-or-later";
    packageJson.name = "@" + answer.npmName + "/" + answer.name;
    packageJson.description = answer.description;
    packageJson.scripts = {};
    packageJson.scripts.test = "mocha -r ts-node/register --bail ./test/**/*Test.ts";

    if (answer.type === "CLI") {
        packageJson.files = ["/dist/"];
        // SCRIPTS
        packageJson.scripts.build = "tsc --watch --project .";
        packageJson.scripts.prepare = "tsc --project .";
        // ENTRY POINTS
        packageJson.bin = "./dist/bin/main.js";
        packageJson.main = "./dist/lib/index.js";
        // OPTIONS
        const cliAnswer = await inquirer.prompt(
            [{
                name: "options",
                type: "checkbox",
                message: "Select optional libraries",
                choices: [
                    {
                        name: "Inquirer",
                        value: {
                            dep: "inquirer",
                            dev: "@types/inquirer",
                        },
                    }],
            }],
        ) as {
            name: string,
            options: Array<{ dep: string, dev: string }>,
        };
        // COPY
        await copyTemplates(__dirname + "/../templates/cli", "./", (filename, text) => {
            if (filename === "README.md_T") {
                return text.replace(/###name###/, answer.name.toUpperCase())
                    .replace(/###description###/, answer.description);
            } else {
                return text;
            }
        });

        // DEPENDENCIES
        devDependencies += (" " + cliAnswer.options.map((item) => item.dev).join(" "));
        dependencies += (" " + cliAnswer.options.map((item) => item.dep).join(" "));

    } else if (answer.type === "Library") {
        packageJson.files = ["/dist/"];
        // SCRIPTS
        packageJson.scripts.build = "tsc --watch --project .";
        packageJson.scripts.prepare = "tsc --project .";
        // ENTRY POINTS
        packageJson.main = "./dist/index.js";
        // OPTIONS
        const choices = [
            {
                name: "React",
                value: {
                    dev: "@types/react",
                    dep: "react",
                },
            }, {
                name: "React DOM",
                value: {
                    dev: "@types/react-dom",
                    dep: "react-dom",
                },
            }, {
                name: "React Router",
                value: {
                    dev: "@types/react-router-dom",
                    dep: "react-router-dom",
                },
            },
        ];
        const libraryAnswer = await inquirer.prompt(
            [{
                name: "options",
                type: "checkbox",
                message: "Select optional libraries",
                choices,
            }],
        ) as {
            options: Array<{ dev: string, dep: string }>,
        };
        // COPY
        await copyTemplates(__dirname + "/../templates/library", "./", (filename, text) => {
            if (filename === "README.md_T") {
                return text.replace(/###name###/, answer.name.toUpperCase())
                    .replace(/###description###/, answer.description);
            } else {
                return text;
            }
        });
        // DEPENDENCIES
        devDependencies += (" " + libraryAnswer.options.map((item) => item.dev).join(" "));
        dependencies += (" " + libraryAnswer.options.map((item) => item.dep).join(" "));
    } else if (answer.type === "Express App") {
        packageJson.files = ["/dist/"];
        // SCRIPTS
        packageJson.scripts.build = "tsc --watch --project .";
        packageJson.scripts.prepare = "tsc --project .";
        packageJson.scripts.start = "nodemon -V dist/bin/main.js";
        // ENTRY POINTS
        packageJson.bin = "dist/bin/main.js";
        packageJson.main = "dist/lib/app.js";
        // OPTIONS
        // COPY
        await copyTemplates(__dirname + "/../templates/server", "./", (filename, text) => {
            if (filename === "README.md_T") {
                return text.replace(/###name###/, answer.name.toUpperCase())
                    .replace(/###description###/, answer.description);
            } else {
                return text;
            }
        });
        // DEPENDENCIES
        dependencies += " express";
        devDependencies += " @types/express nodemon";
    } else if (answer.type === "Standalone React App") {
        // SCRIPTS
        packageJson.scripts.build = "webpack --mode production";
        packageJson.scripts.start = "webpack-dev-server --content-base=dist --inline --watch --hot";
        // ENTRY POINTS
        // OPTIONS
        const clientAnswer = await inquirer.prompt(
            [{
                name: "name",
                type: "input",
                message: "What is the window title?",
                validate: (temp) => /(^[^\t\n\f\/>"'=]+$)/.test(temp),
            }, {
                name: "options",
                type: "checkbox",
                message: "Select optional libraries",
                choices: [{
                    name: "React Router",
                    value: {
                        dev: " react-router-dom @types/react-router-dom",
                        dep: "",
                    },
                }],
            }],
        ) as {
            name: string,
            options: Array<{ dev: string, dep: string }>,
        };
        // COPY
        await copyTemplates(__dirname + "/../templates/client", "./", (filename, text) => {
            if (filename === "webpack.config.js_T") {
                return text.replace(/###name###/, clientAnswer.name);
            } else if (filename === "README.md_T") {
                return text.replace(/###name###/, answer.name.toLocaleUpperCase())
                    .replace(/###description###/, answer.description);
            } else {
                return text;
            }
        });
        // DEPENDENCIES
        devDependencies += (" " + clientAnswer.options.map((item) => item.dev).join(""));
        dependencies += (" " + clientAnswer.options.map((item) => item.dep).join(""));
        // tslint:disable-next-line: max-line-length
        devDependencies += " @types/react @types/react-dom html-webpack-plugin react react-dom css-loader style-loader file-loader ts-loader webpack webpack-cli webpack-dev-server";
    } else if (answer.type === "React + Express") {
        // SCRIPTS
        // tslint:disable-next-line: max-line-length
        packageJson.scripts.build = "concurrently \"webpack-cli --watch --mode development\" \"tsc --project ./src/server --watch\"";
        packageJson.scripts.start = "nodemon -V dist/server/bin/main";
        // ENTRY POINTS
        packageJson.bin = "dist/server/bin/main.js";
        packageJson.main = "dist/server/lib/app.js";
        // OPTIONS
        const bothAnswer = await inquirer.prompt(
            [{
                name: "name",
                type: "input",
                message: "What is the window title?",
                validate: (temp) => /(^[^\t\n\f\/>"'=]+$)/.test(temp),
            }, {
                name: "options",
                type: "checkbox",
                message: "Select optional libraries",
                choices: [{
                    name: "React Router",
                    value: {
                        dev: " react-router-dom @types/react-router-dom",
                        dep: "",
                    },
                }],
            }],
        ) as {
            name: string,
            options: Array<{ dev: string, dep: string }>,
        };
        // COPY
        await copyTemplates(__dirname + "/../templates/both", "./", (filename, text) => {
            if (filename === "webpack.config.js_T") {
                return text.replace(/###name###/, bothAnswer.name);
            } else if (filename === "README.md_T") {
                return text.replace(/###name###/, answer.name.toLocaleUpperCase())
                    .replace(/###description###/, answer.description);
            } else {
                return text;
            }
        });
        // DEPENDENCIES
        dependencies += " express";
        // tslint:disable-next-line: max-line-length
        devDependencies += " @types/express nodemon @types/react @types/react-dom html-webpack-plugin react react-dom css-loader style-loader file-loader ts-loader webpack webpack-cli concurrently";
    }

    await fs.writeFile("package.json", JSON.stringify(packageJson, null, 4));
    process.stdout.write(`Installing dev dependencies: npm i -D ${devDependencies}\n`);
    await promiseExec(`npm i -D ${devDependencies}`);
    if (dependencies) {
        process.stdout.write(`Installing core dependencies: npm i ${dependencies}\n`);
        await promiseExec(`npm i ${dependencies}`);
    }
    await promiseExec("git init");
    await promiseExec("git add .");
    await promiseExec("git commit -m \"initial commit\"");
}

export function promiseExec(command: string) {
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

export async function copyTemplates(scrPath: string,
    destpath: string,
    processTemplate: (filename: string, templateText: string) => string) {

    const files = await fs.readdir(scrPath);
    await Promise.all(files.map((file) => {
        return (async () => {
            const stat = await fs.stat(`${scrPath}/${file}`);
            if (stat.isDirectory()) {
                await fs.mkdir(`${destpath}/${file}`);
                await copyTemplates(`${scrPath}/${file}`, `${destpath}/${file}`, processTemplate);
            } else {
                const contents = (await fs.readFile(`${scrPath}/${file}`)).toString("utf8");
                await fs.writeFile(`${destpath}/${file.replace(/_T/, "")}`, processTemplate(file, contents));
            }
        })();
    }));
}
