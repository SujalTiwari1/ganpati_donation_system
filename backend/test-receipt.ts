import { receiptService } from "./src/modules/receipt/receipt.service";

async function run() {
  try {
    console.log("Generating...");
    await receiptService.generateReceipt("35ae891d-64b9-4037-9f29-4eb3409788cf");
    console.log("Success!");
  } catch (err) {
    console.error("Failed:", err);
  }
}
run();
