import { correctAllCreditUsage, getCreditUsageAuditReport } from "../server/credit-usage-audit";

async function main() {
  const apply = process.argv.includes("--apply");
  const report = await getCreditUsageAuditReport();
  const flagged = report.accounts.filter((account) => account.hasDiscrepancy || account.currentCredits < 0 || account.newBalance < 0);

  console.log(`Official prices: aura ${report.prices.aura_analysis}, object ${report.prices.object_analysis}, numerology ${report.prices.numerology}, find healer ${report.prices.healer_booking}, journal ${report.prices.journaling}, meditation ${report.prices.meditation}`);
  console.log(`Checked ${report.totalUsers} accounts. ${report.accountsWithDiscrepancy} need a usage correction. ${report.negativeAfterCorrection} would be negative.`);
  console.log("");
  console.log("username\ttype\tcurrent\texpected_spend\tadjust\tcorrect_balance");
  for (const account of flagged) {
    console.log(
      `${account.username}\t${account.userType}\t${account.currentCredits}\t${account.expectedSpend}\t${account.deltaAmount}\t${account.newBalance}`,
    );
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write usage_correction transactions and update balances.");
    process.exit(0);
  }

  const result = await correctAllCreditUsage();
  console.log(`\nApplied: ${result.usersChanged} account(s) changed. Negative balances: ${result.negativeBalances}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
