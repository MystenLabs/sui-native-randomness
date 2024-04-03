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

  const [feeCoin] = transactionBlock.splitCoins(transactionBlock.gas, [
    transactionBlock.pure(100_000_000),
  ]);
  transactionBlock.moveCall({
    target: `${packageId}::${moduleName}::play`,
    arguments: [
      transactionBlock.object(
        "0xdf4273ed5c0f90fecc40af54f9d37ac86c44e54588dc52da27bf9cd5e64e8b48"
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
