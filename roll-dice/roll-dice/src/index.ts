import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
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
  const moduleName = "roll_dice";

  let transaction = new Transaction();

  transaction.moveCall({
    target: `${packageId}::${moduleName}::roll_dice_emit_event_mint_nft`,
    arguments: [
      transaction.object("0x8"), // r: Random
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
