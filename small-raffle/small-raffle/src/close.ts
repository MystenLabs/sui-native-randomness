import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import * as dotenv from "dotenv";

(async () => {
  dotenv.config({ path: "../.env" });

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
    target: `${packageId}::${moduleName}::close`,
    arguments: [
      transaction.object(
        "0x15cbd693f7d390f9f066276750866fd578afeeccd132e39d4fd3ad1a3efbc29a"
      ), // game: Game
      transaction.object("0x8"), // r: &Random
      transaction.object(SUI_CLOCK_OBJECT_ID), // clock: &Clock
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
