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

  const [feeCoin] = transaction.splitCoins(transaction.gas, [
    transaction.pure.u64(100_000_000),
  ]);
  transaction.moveCall({
    target: `${packageId}::${moduleName}::play`,
    arguments: [
      transaction.object(
        "0x41422660400fa7b64cbf2270b28601366418513161188e6799e80b57f7fe15d3"
      ), // game: &mut Game
      transaction.object(feeCoin), // coin: Coin<SUI>
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
