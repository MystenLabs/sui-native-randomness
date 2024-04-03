import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiClient } from "@mysten/sui.js/client";
import * as dotenv from "dotenv";

(async () => {
  dotenv.config({ path: "../.env" });

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
    target: `${packageId}::${moduleName}::close`,
    arguments: [
      transactionBlock.object(
        "0x15cbd693f7d390f9f066276750866fd578afeeccd132e39d4fd3ad1a3efbc29a"
      ), // game: Game
      transactionBlock.object("0x8"), // r: &Random
      transactionBlock.object("0x6"), // clock: &Clock,
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
