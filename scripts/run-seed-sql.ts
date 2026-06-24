import { join } from "path";
import { readFileSync } from "fs";

import { prisma } from "../src/shared/lib/prisma";

async function main() {
  console.log("Starting DB seeding from SQL file...");

  try {
    const sqlFilePath = join(process.cwd(), "scripts", "load-seed-data.sql");
    console.log(`Reading SQL file from: ${sqlFilePath}`);
    const sqlContent = readFileSync(sqlFilePath, "utf8");

    // Split SQL by semicolons, but respect dollar quotes ($$) for PL/pgSQL blocks
    const statements: string[] = [];
    let currentStatement = "";
    let inDollarQuote = false;

    const lines = sqlContent.split("\n");
    for (const line of lines) {
      // Toggle dollar quote flag if we see odd number of $$ on this line
      const dollarCount = (line.match(/\$\$/g) || []).length;
      if (dollarCount % 2 !== 0) {
        inDollarQuote = !inDollarQuote;
      }

      currentStatement += line + "\n";

      // If we are not inside a PL/pgSQL block and the line ends with a semicolon
      if (!inDollarQuote && line.trim().endsWith(";")) {
        const statementText = currentStatement.trim();
        if (statementText) {
          statements.push(statementText);
        }
        currentStatement = "";
      }
    }

    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`Parsed ${statements.length} separate SQL statements.`);

    for (let idx = 0; idx < statements.length; idx++) {
      const stmt = statements[idx];
      console.log(`Executing statement [${idx + 1}/${statements.length}]...`);
      // Print first line or snippet of the statement for context
      console.log(`> ${stmt.split("\n")[0]}...`);
      await prisma.$executeRawUnsafe(stmt);
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error executing seeding SQL script:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
