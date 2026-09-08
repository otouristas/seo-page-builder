import { readFileSync } from "node:fs";
const file = process.argv[2];
if (!file) {
  console.error(
    "Usage: node scripts/cost-model.mjs measured-costs.json. See docs/COST_MODEL.md. No default costs are assumed.",
  );
  process.exit(1);
}
const costs = JSON.parse(readFileSync(file, "utf8"));
for (const k of [
  "page",
  "draft",
  "answer",
  "serp",
  "workspaceOperations",
  "paymentPercent",
  "paymentFixed",
  "refundReservePercent",
])
  if (!Number.isFinite(costs[k]) || costs[k] < 0)
    throw new Error(`Missing/nonnegative measured input: ${k}`);
const plans = [
  ["3-day $1 trial", 1, 20, 3, 3, 3],
  ["Maki", 29, 200, 20, 40, 20],
  ["Nigiri", 79, 750, 75, 120, 75],
  ["Omakase", 149, 2000, 200, 300, 200],
];
console.table(
  plans.map(([plan, revenue, pages, drafts, answers, serps]) => {
    const variable =
      pages * costs.page +
      drafts * costs.draft +
      answers * costs.answer +
      serps * costs.serp +
      costs.workspaceOperations;
    const payment = (revenue * costs.paymentPercent) / 100 + costs.paymentFixed;
    const reserve = (revenue * costs.refundReservePercent) / 100;
    const contribution = revenue - variable - payment - reserve;
    return {
      plan,
      revenue,
      maximumUsageCost: +variable.toFixed(2),
      paymentFee: +payment.toFixed(2),
      reserve: +reserve.toFixed(2),
      contribution: +contribution.toFixed(2),
      marginPercent: +((contribution / revenue) * 100).toFixed(1),
    };
  }),
);
console.log(
  "Scenario only. Includes full allowance consumption; excludes tax remittances and unentered costs. This script never enables sales.",
);
