import { config } from "./config.js";
import { getMatchingTransactions } from "./qonto.js";
import { generateReceipt, formatPeriod } from "./receipt.js";
import { sendReceipt } from "./email.js";
import { isProcessed, markProcessed } from "./tracker.js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

async function main() {
  console.log("Fetching credit transfers from Qonto...");
  const transactions = await getMatchingTransactions();
  console.log(`Found ${transactions.length} matching transaction(s).`);

  let newCount = 0;

  for (const tx of transactions) {
    if (isProcessed(tx.transaction_id)) {
      console.log(`  [skip] ${tx.transaction_id} already processed.`);
      continue;
    }

    const period = formatPeriod(tx.settled_at || tx.emitted_at);
    const paymentDate = tx.settled_at || tx.emitted_at;

    console.log(`  [new] Transaction ${tx.transaction_id} — ${period}`);

    const pdfBuffer = await generateReceipt({
      period,
      paymentDate,
      rentAmount: tx.amount,
    });

    if (config.dryRun) {
      const filename = `quittance-${period.replace(/\s/g, "-").toLowerCase()}.pdf`;
      const outPath = join(import.meta.dirname, "..", filename);
      writeFileSync(outPath, pdfBuffer);
      console.log(`  [dry-run] PDF saved: ${outPath}`);
    } else {
      await sendReceipt(pdfBuffer, period);
      console.log(`  [sent] Email sent to: ${config.tenant.emails.join(", ")}`);
    }

    markProcessed(tx.transaction_id);
    newCount++;
  }

  if (newCount === 0) {
    console.log("No new rent payments to process.");
  } else {
    console.log(`Processed ${newCount} new rent payment(s).`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
