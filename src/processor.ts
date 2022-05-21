import { V1Junction_AccountId32, V1Junction_AccountKey20 } from "./types/v11";
import { Store, SubstrateProcessor } from "@subsquid/substrate-processor";
import assert from "assert";
import {
  XTokensTransferredMultiAssetsEvent,
  XTokensTransferredMultiAssetWithFeeEvent,
  XTokensTransferredMultiCurrenciesEvent,
  XTokensTransferredWithFeeEvent,
  TokensTransferEvent
} from "./types/events";
import { Account, Height, Token, Transfer, XTransfer } from "./model";
import { CurrencyId_Token as CurrencyId_TokenV6 } from "./types/v6";
import { CurrencyId_Token as CurrencyId_TokenV15 } from "./types/v15";
import * as ss58 from "@subsquid/ss58";
import { LessThanOrEqual } from "typeorm";
import { debug } from "util";

require("dotenv").config()

const processor = new SubstrateProcessor(
  "kintsugi"
);

const archive = process.env.ARCHIVE_ENDPOINT;
assert(!!archive);
const chain = process.env.CHAIN_ENDPOINT;
assert(!!chain);
processor.setDataSource({ archive, chain });
processor.setTypesBundle("typesBundle.json");

const processFrom = Number(process.env.PROCESS_FROM) || 0;
processor.setBlockRange({ from: processFrom });


export const currencyId = {
  token: {
    encode(token: CurrencyId_TokenV6 | CurrencyId_TokenV15) {
      if (token.value.__kind === "INTERBTC") {
        token = {
          ...token,
          value: {
            __kind: "INTR"
          }
        };
      }
      return Token[(token as CurrencyId_TokenV15).value.__kind];
    },
  },
};


processor.addEventHandler("tokens.Transfer", async (ctx) => {
  const rawEvent = new TokensTransferEvent(ctx);
  let e;
  if(rawEvent.isV10) {
    e = rawEvent.asV10;
  }
  else if(rawEvent.isV15) {
    e = rawEvent.asV15;
  }
  else {
    console.log("Not the right event version?");
    return
  }

  const height = await blockToHeight(ctx.store, ctx.block.height, "RequestIssue");

  const from = ss58.codec("kintsugi").encode(e.from);
  const to = ss58.codec("kintsugi").encode(e.to);

  const fromAcc = await getOrCreate(ctx.store, Account, from);
  await ctx.store.save(fromAcc);
  const toAcc = await getOrCreate(ctx.store, Account, to);
  await ctx.store.save(toAcc);

  const id = `${ctx.event.id}-transfer`;
  const myTransfer = await getOrCreate(ctx.store, Transfer, id) as Transfer;
  myTransfer.from = fromAcc;
  myTransfer.to = toAcc;
  myTransfer.height = height;
  myTransfer.timestamp = new Date(ctx.block.timestamp);
  myTransfer.token = currencyId.token.encode(e.currencyId)
  myTransfer.amount = e.amount
  myTransfer.id = id;
  await ctx.store.save(myTransfer);



  console.log(`${fromAcc.id} -> ${toAcc.id}: ${e.amount} ${myTransfer.token}`)
});


processor.addEventHandler("xTokens.TransferredMultiCurrencies", async (ctx) => {
  const rawEvent = new XTokensTransferredMultiCurrenciesEvent(ctx);
  let e;
  if(rawEvent.isV10) {
    e = rawEvent.asV10;
  }
  else {
    console.log("Not the right event version?");
    return
  }
  const height = await blockToHeight(ctx.store, ctx.block.height, "xTokens.TransferredMultiCurrencies");
});

processor.addEventHandler("xTokens.TransferredWithFee", async (ctx) => {
  const rawEvent = new XTokensTransferredWithFeeEvent(ctx);
  let e;
  if(rawEvent.isV10) {
    e = rawEvent.asV10;
  }
  else {
    console.log("Not the right event version?");
    return
  }
  const height = await blockToHeight(ctx.store, ctx.block.height, "RequestIssue");
});

processor.addEventHandler("xTokens.TransferredMultiAssetWithFee", async (ctx) => {
  const rawEvent = new XTokensTransferredMultiAssetWithFeeEvent(ctx);
  let e;
  if(rawEvent.isV10) {
    e = rawEvent.asV10;
  }
  else {
    console.log("Not the right event version?");
    return
  }
  const height = await blockToHeight(ctx.store, ctx.block.height, "RequestIssue");
});

const isToken = (object: any): object is Token => !!object &&
  object.name === 'currencyId' && !!object.value.token;

processor.addEventHandler("xTokens.TransferredMultiAssets", async (ctx) => {
  const rawEvent = new XTokensTransferredMultiAssetsEvent(ctx);
  let myToken : Token = Token.INTR; // if you see this in the data it's likely to be a bug
  if(ctx.extrinsic){
    if(Array.isArray(ctx.extrinsic.args))
    {
      const tokenCurrency = ctx.extrinsic.args[0]
      if(isToken(tokenCurrency)){
        // @ts-ignore
        myToken = Token[tokenCurrency.value.token];
      }
    }
    else { return }
  }
  else{ return }

  let e;
  if(rawEvent.isV10) {
    e = rawEvent.asV10;
  }
  else if(rawEvent.isV11) {
    e = rawEvent.asV11;
  }
  else {
    console.log("Not the right event version?");
    return
  }
  const height = await blockToHeight(ctx.store, ctx.block.height, "xTokens.TransferredMultiAssets");
  const from = ss58.codec("kintsugi").encode(e.sender);
  const fromAcc = await getOrCreate(ctx.store, Account, from);
  await ctx.store.save(fromAcc);

  const id = `${ctx.event.id}-xtransfer`;
  const myTransfer = await getOrCreate(ctx.store, XTransfer, id);
  myTransfer.from = fromAcc;
  myTransfer.height = height;
  myTransfer.timestamp = new Date(ctx.block.timestamp);
  myTransfer.fromChain = 2092; // i guess it's always kintsugi
  const details = e.dest.interior;
  if ("value" in details && Array.isArray(details.value)) {
    if (details.value.length === 2) {
      if (details.value[0].__kind === 'Parachain') {
        const my_parachain = details.value[0];
        const to_details = details.value[1] as V1Junction_AccountId32 | V1Junction_AccountKey20;
        if (to_details.__kind === 'AccountId32' && my_parachain.value === 2000) {
          myTransfer.toChain = my_parachain.value;
          myTransfer.token = myToken;
          myTransfer.amount = (e.assets[0].fun.value) as bigint
          const toAccount = ss58.codec("karura").encode(to_details.id);
          myTransfer.to = await getOrCreate(ctx.store, Account, toAccount);
          await ctx.store.save(myTransfer.to);
          console.log(`${fromAcc.id} -> ${myTransfer.to.id} ${myTransfer.token}`);
          myTransfer.id = id;
          await ctx.store.save(myTransfer);
        }
        // Moonriver
        if (to_details.__kind === 'AccountKey20' && my_parachain.value === 2023) {
          myTransfer.toChain = my_parachain.value;
          myTransfer.token = myToken;
          myTransfer.amount = (e.assets[0].fun.value) as bigint;
          const toAccount = '0x' + Buffer.from(to_details.key).toString('hex');
          myTransfer.to = await getOrCreate(ctx.store, Account, toAccount);
          await ctx.store.save(myTransfer.to);
          console.log(`${fromAcc.id} -> ${e.assets[0].fun.value} ${myTransfer.token}`);
          myTransfer.id = id;
          await ctx.store.save(myTransfer);
        }
      }
    }
  }
})


processor.run();

async function getOrCreate<T extends { id: string }>(
  store: Store,
  EntityConstructor: EntityConstructor<T>,
  id: string
): Promise<T> {
  let entity = await store.get<T>(EntityConstructor, {
    where: { id },
  });

  if (entity == null) {
    entity = new EntityConstructor();
    entity.id = id;
  }

  return entity;
}

type EntityConstructor<T> = {
  new (...args: any[]): T;
};

export async function blockToHeight(
  store: Store,
  absoluteBlock: number,
  eventName?: string // for logging purposes
): Promise<Height> {
  const existingBlockHeight = await store.get(Height, {
    where: { absolute: absoluteBlock },
  });
  if (existingBlockHeight !== undefined) {
    // was already set for current block, either by UpdateActiveBlock or previous invocation of blockToHeight
    return existingBlockHeight;
  } else {
    // not set for current block - get latest value of `active` and save Height for current block (if exists)
    const currentActive = (
      await store.get(Height, {
        where: { absolute: LessThanOrEqual(absoluteBlock) },
        order: { active: "DESC" },
      })
    )?.active;
    if (currentActive === undefined) {
      debug(
        `WARNING: Did not find Height entity for absolute block ${absoluteBlock}. This means the chain did not generate UpdateActiveBlock events priorly, yet other events are being processed${
          eventName ? ` (such as ${eventName})` : ""
        }, which may not be normal.`
      );
    }
    const height = new Height({
      id: absoluteBlock.toString(),
      absolute: absoluteBlock,
      active: currentActive || 0,
    });
    await store.save(height);
    return height;
  }
}

