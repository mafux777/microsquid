"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockToHeight = exports.currencyId = void 0;
const substrate_processor_1 = require("@subsquid/substrate-processor");
const assert_1 = __importDefault(require("assert"));
const events_1 = require("./types/events");
const model_1 = require("./model");
const ss58 = __importStar(require("@subsquid/ss58"));
const typeorm_1 = require("typeorm");
const util_1 = require("util");
require("dotenv").config();
const util = __importStar(require("@polkadot/util-crypto"));
//const util = require("@polkadot/util-crypto");
const prefixes = {
    polkadot: 0,
    kusama: 2,
    plasm: 5,
    bifrost: 6,
    edgeware: 7,
    karura: 8,
    reynolds: 9,
    acala: 10,
    laminar: 11,
    substratee: 13,
    kulupu: 16,
    darwinia: 18,
    robonomics: 32,
    centrifuge: 36,
    substrate: 42,
    chainx: 44
};
const processor = new substrate_processor_1.SubstrateProcessor("kintsugi");
const archive = process.env.ARCHIVE_ENDPOINT;
(0, assert_1.default)(!!archive);
const chain = process.env.CHAIN_ENDPOINT;
(0, assert_1.default)(!!chain);
processor.setDataSource({ archive, chain });
processor.setTypesBundle("typesBundle.json");
const processFrom = Number(process.env.PROCESS_FROM) || 0;
processor.setBlockRange({ from: processFrom });
exports.currencyId = {
    token: {
        encode(token) {
            if (token.value.__kind === "INTERBTC") {
                token = {
                    ...token,
                    value: {
                        __kind: "INTR"
                    }
                };
            }
            return model_1.Token[token.value.__kind];
        },
    },
};
processor.addEventHandler("tokens.Transfer", async (ctx) => {
    const rawEvent = new events_1.TokensTransferEvent(ctx);
    let e;
    if (rawEvent.isV10) {
        e = rawEvent.asV10;
    }
    else if (rawEvent.isV15) {
        e = rawEvent.asV15;
    }
    else {
        console.log("Not the right event version?");
        return;
    }
    const height = await blockToHeight(ctx.store, ctx.block.height, "RequestIssue");
    const from = ss58.codec("kintsugi").encode(e.from);
    const to = ss58.codec("kintsugi").encode(e.to);
    const fromAcc = await getOrCreate(ctx.store, model_1.Account, from);
    fromAcc['kintsugi'] = ss58.codec("kintsugi").encode(e.from);
    fromAcc['karura'] = ss58.codec("karura").encode(e.from);
    fromAcc['kusama'] = ss58.codec("kusama").encode(e.from);
    fromAcc['moonriver'] = '0x' + Buffer.from(util.addressToEvm(util.encodeAddress(e.from))).toString('hex');
    await ctx.store.save(fromAcc);
    const toAcc = await getOrCreate(ctx.store, model_1.Account, to);
    toAcc['kintsugi'] = ss58.codec("kintsugi").encode(e.to);
    toAcc['karura'] = ss58.codec("karura").encode(e.to);
    toAcc['kusama'] = ss58.codec("kusama").encode(e.to);
    toAcc['moonriver'] = '0x' + Buffer.from(util.addressToEvm(util.encodeAddress(e.to))).toString('hex');
    await ctx.store.save(toAcc);
    const id = `${ctx.event.id}-transfer`;
    const myTransfer = await getOrCreate(ctx.store, model_1.Transfer, id);
    myTransfer.from = fromAcc;
    myTransfer.fromChain = 2092;
    myTransfer.to = toAcc;
    myTransfer.toChain = 2092;
    myTransfer.height = height;
    myTransfer.timestamp = new Date(ctx.block.timestamp);
    myTransfer.token = exports.currencyId.token.encode(e.currencyId);
    myTransfer.amount = e.amount;
    myTransfer.id = id;
    await ctx.store.save(myTransfer);
    console.log(`${fromAcc.id} -> ${toAcc.id}: ${e.amount} ${myTransfer.token}`);
});
processor.addEventHandler("xTokens.TransferredMultiCurrencies", async (ctx) => {
    const rawEvent = new events_1.XTokensTransferredMultiCurrenciesEvent(ctx);
    let e;
    if (rawEvent.isV10) {
        e = rawEvent.asV10;
    }
    else {
        console.log("Not the right event version?");
        return;
    }
    const height = await blockToHeight(ctx.store, ctx.block.height, "xTokens.TransferredMultiCurrencies");
});
processor.addEventHandler("xTokens.TransferredWithFee", async (ctx) => {
    const rawEvent = new events_1.XTokensTransferredWithFeeEvent(ctx);
    let e;
    if (rawEvent.isV10) {
        e = rawEvent.asV10;
    }
    else {
        console.log("Not the right event version?");
        return;
    }
    const height = await blockToHeight(ctx.store, ctx.block.height, "RequestIssue");
});
processor.addEventHandler("xTokens.TransferredMultiAssetWithFee", async (ctx) => {
    const rawEvent = new events_1.XTokensTransferredMultiAssetWithFeeEvent(ctx);
    let e;
    if (rawEvent.isV10) {
        e = rawEvent.asV10;
    }
    else {
        console.log("Not the right event version?");
        return;
    }
    const height = await blockToHeight(ctx.store, ctx.block.height, "RequestIssue");
});
const isToken = (object) => !!object &&
    object.name === 'currencyId' && !!object.value.token;
processor.addEventHandler("xTokens.TransferredMultiAssets", async (ctx) => {
    const rawEvent = new events_1.XTokensTransferredMultiAssetsEvent(ctx);
    let myToken = model_1.Token.INTR; // if you see this in the data it's likely to be a bug
    if (ctx.extrinsic) {
        if (Array.isArray(ctx.extrinsic.args)) {
            const tokenCurrency = ctx.extrinsic.args[0];
            if (isToken(tokenCurrency)) {
                // @ts-ignore
                myToken = model_1.Token[tokenCurrency.value.token];
            }
        }
        else {
            return;
        }
    }
    else {
        return;
    }
    let e;
    if (rawEvent.isV10) {
        e = rawEvent.asV10;
    }
    else if (rawEvent.isV11) {
        e = rawEvent.asV11;
    }
    else {
        console.log("Not the right event version?");
        return;
    }
    const height = await blockToHeight(ctx.store, ctx.block.height, "xTokens.TransferredMultiAssets");
    const from = ss58.codec("kintsugi").encode(e.sender);
    const fromAcc = await getOrCreate(ctx.store, model_1.Account, from);
    await ctx.store.save(fromAcc);
    const id = `${ctx.event.id}-xtransfer`;
    const myTransfer = await getOrCreate(ctx.store, model_1.Transfer, id);
    myTransfer.from = fromAcc;
    myTransfer.height = height;
    myTransfer.timestamp = new Date(ctx.block.timestamp);
    myTransfer.fromChain = 2092; // i guess it's always kintsugi
    const details = e.dest.interior;
    if ("value" in details && Array.isArray(details.value)) {
        if (details.value.length === 2) {
            if (details.value[0].__kind === 'Parachain') {
                const my_parachain = details.value[0];
                const to_details = details.value[1];
                // Karura
                if (to_details.__kind === 'AccountId32' && my_parachain.value === 2000) {
                    myTransfer.toChain = my_parachain.value;
                    myTransfer.token = myToken;
                    myTransfer.amount = (e.assets[0].fun.value);
                    const toAccount = ss58.codec("kintsugi").encode(to_details.id);
                    // we use kintsugi address as the main address and assume karura address has been saved already
                    myTransfer.to = await getOrCreate(ctx.store, model_1.Account, toAccount);
                    await ctx.store.save(myTransfer.to);
                    console.log(`${fromAcc.id} -> ${myTransfer.to.id} ${myTransfer.token}`);
                    myTransfer.id = id;
                    await ctx.store.save(myTransfer);
                }
                // Moonriver
                if (to_details.__kind === 'AccountKey20' && my_parachain.value === 2023) {
                    myTransfer.toChain = my_parachain.value;
                    myTransfer.token = myToken;
                    myTransfer.amount = (e.assets[0].fun.value);
                    const toAccount = '0x' + Buffer.from(to_details.key).toString('hex');
                    const substrate = util.evmToAddress(to_details.key);
                    myTransfer.to = await getOrCreate(ctx.store, model_1.Account, toAccount);
                    myTransfer.to['kusama'] = 'unknown';
                    await ctx.store.save(myTransfer.to);
                    console.log(`${fromAcc.id} -> ${e.assets[0].fun.value} ${myTransfer.token}`);
                    myTransfer.id = id;
                    await ctx.store.save(myTransfer);
                }
            }
        }
    }
});
processor.run();
async function getOrCreate(store, EntityConstructor, id) {
    let entity = await store.get(EntityConstructor, {
        where: { id },
    });
    if (entity == null) {
        entity = new EntityConstructor();
        entity.id = id;
    }
    return entity;
}
async function blockToHeight(store, absoluteBlock, eventName // for logging purposes
) {
    const existingBlockHeight = await store.get(model_1.Height, {
        where: { absolute: absoluteBlock },
    });
    if (existingBlockHeight !== undefined) {
        // was already set for current block, either by UpdateActiveBlock or previous invocation of blockToHeight
        return existingBlockHeight;
    }
    else {
        // not set for current block - get latest value of `active` and save Height for current block (if exists)
        const currentActive = (await store.get(model_1.Height, {
            where: { absolute: (0, typeorm_1.LessThanOrEqual)(absoluteBlock) },
            order: { active: "DESC" },
        }))?.active;
        if (currentActive === undefined) {
            (0, util_1.debug)(`WARNING: Did not find Height entity for absolute block ${absoluteBlock}. This means the chain did not generate UpdateActiveBlock events priorly, yet other events are being processed${eventName ? ` (such as ${eventName})` : ""}, which may not be normal.`);
        }
        const height = new model_1.Height({
            id: absoluteBlock.toString(),
            absolute: absoluteBlock,
            active: currentActive || 0,
        });
        await store.save(height);
        return height;
    }
}
exports.blockToHeight = blockToHeight;
//# sourceMappingURL=processor.js.map