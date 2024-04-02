import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { SuiClient } from "@mysten/sui.js/client";
import * as dotenv from "dotenv";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";

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

  // transactionBlock.splitCoins(coin: "", amounts: 1000);

  const [feeCoin] = transactionBlock.splitCoins(transactionBlock.gas, [
    transactionBlock.pure(100_000_000),
  ]);
  transactionBlock.moveCall({
    target: `${packageId}::${moduleName}::play`,
    arguments: [
      transactionBlock.object(
        "0xcf9613a59508a079c349c8be8400570d24e86c951b9521e2d2a26bf8ca2fe182"
      ), // game: &mut Game
      transactionBlock.object(feeCoin), // coin: Coin<SUI>
      transactionBlock.object(SUI_CLOCK_OBJECT_ID), // clock: &Clock
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
