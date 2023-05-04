import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { ORM } from "@bismuthmoe/arcadia/dist/orm/ORM";

export interface ScriptContext {
    orm: ORM;
    choices?: Record<string, any>;

}

interface Script {
    name: string;
    choices?: any[];
    execute: (ctx: ScriptContext) => Promise<void>;
}

(async function () {
    // Import all the scripts.
    const scripts: Script[] = [];
    let scriptCount = 0;

    const files = fs.readdirSync(path.join(__dirname, "scripts")).filter(file => file.endsWith(".ts"));


    for (const file of files) {
        const script = await import(path.join(__dirname, "scripts", file));
        scripts.push(script as Script);
    }

    // Ask the user which script they want to run.
    inquirer.prompt([
        {
            type: "list",
            name: "script",
            message: "Which script do you want to run?",
            choices: scripts.map(script => script.name)
        }
    ]).then(answers => {
        // Find the script object.
        const script = scripts.find(script => script.name === answers.script);


        // Empty line.
        console.log("");

        if (script?.choices) {
            inquirer.prompt(script.choices).then(answers => {
                console.log("");
                script.execute({
                    prisma: new PrismaExtendedClient(),
                    choices: answers
                });
            });

            return;
        } else {
            // Run the script.
            script?.execute({
                prisma: new PrismaExtendedClient(),
            });
        }
    });
})();
