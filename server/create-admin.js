/* Usage:  npm run create-admin
           npm run create-admin -- --email you@company.com --name "Your Name" --role admin
   The password is typed at a hidden prompt so it never lands in shell history.
   For scripted setups (no terminal) set PSC_PASSWORD in the environment instead. */
import readline from "node:readline";
import { createUser } from "./auth.js";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, all) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), all[i + 1]]);
    return acc;
  }, [])
);

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (str) => {
        if (str.includes(question)) rl.output.write(question);
        else if (str === "\r\n" || str === "\n") rl.output.write("\n");
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

try {
  console.log("\nProperty Search Capital: create an admin account\n");
  const email = args.email || (await ask("Email: "));
  const name = args.name || (await ask("Full name: "));
  const role = args.role || "admin";
  let password = process.env.PSC_PASSWORD;
  if (!password) {
    password = await ask("Password (min 10 chars, letters + numbers): ", { hidden: true });
    const confirm = await ask("Confirm password: ", { hidden: true });
    if (password !== confirm) throw new Error("Passwords do not match.");
  }
  createUser({ email, name, password, role });
  console.log(`\nDone. ${role} account created for ${email}. Sign in at /admin/login\n`);
} catch (error) {
  console.error(`\nCould not create account: ${error.message}\n`);
  process.exitCode = 1;
}
