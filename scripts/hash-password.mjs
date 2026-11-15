// Usage: npm run hash-password -- "your-new-password"
// Prints a bcrypt hash to paste into ADMIN_PASSWORD_HASH.
import bcrypt from "bcryptjs";

const pw = process.argv[2];
if (!pw || pw.length < 10) {
  console.error('Usage: npm run hash-password -- "a-password-of-10+-characters"');
  process.exit(1);
}
const hash = bcrypt.hashSync(pw, 12);
console.log("\nADMIN_PASSWORD_HASH (paste into .env.local / Vercel):\n");
console.log(hash);
console.log("\nIn .env.local, escape each $ as \\$ (Next.js expands $ in env files).");
console.log("In the Vercel dashboard, paste it exactly as shown.\n");
