import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import * as dotenv from "dotenv";

(async () => {
  dotenv.config({ path: "../.env" });

  const oneMinute = 1 * 60 * 1000; // 1 minute in milliseconds

  const phrase = process.env.ADMIN_PHRASE;
  const keypair = Ed25519Keypair.deriveKeypair(phrase!);

  // Client
  const fullnode = process.env.SUI_NETWORK!;
  const client = new SuiClient({
    url: fullnode,
  });

  const packageId = process.env.PACKAGE_ADDRESS;
  const moduleName = "small_raffle";

  let transaction = new Transaction();

  transaction.moveCall({
    target: `${packageId}::${moduleName}::create`,
    arguments: [
      transaction.pure.u64(Date.now() + oneMinute), // end_time: u64
      transaction.pure.u64(100_000_000), // cost_in_sui: u64
    ],
  });

  try {
    await client
      .signAndExecuteTransaction({
        transaction: transaction,
        signer: keypair,
      })
      .then((response) => {
        console.log("Transaction response: ", response);
        console.log("Transaction digest: ", response.digest);
      });
  } catch (e) {
    console.error(e);
  }
})();
