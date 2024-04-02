import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiClient } from "@mysten/sui.js/client";
import * as dotenv from "dotenv";

(async () => {
  dotenv.config({ path: "../.env" });

  const oneMinute = 1 * 60 * 1000; // 1 minute in milliseconds

  const phrase = process.env.ADMIN_PHRASE;
  const keypair = Ed25519Keypair.deriveKeypair(phrase!);

  // Client
  const fullnode = process.env.FULLNODE!;
  const client = new SuiClient({
    url: fullnode,
  });

  const packageId = process.env.PACKAGE_ID;
  const moduleName = "small_raffle";

  let transactionBlock = new TransactionBlock();

  transactionBlock.moveCall({
    target: `${packageId}::${moduleName}::create`,
    arguments: [
      transactionBlock.pure(Date.now() + oneMinute), // end_time: u64
      transactionBlock.pure(100_000_000), // cost_in_sui: u64
    ],
  });

  try {
    await client.signAndExecuteTransactionBlock({
      transactionBlock: transactionBlock,
      signer: keypair,
    });
  } catch (e) {
    console.error(e);
  }
})();
