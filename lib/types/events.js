"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XTokensTransferredWithFeeEvent = exports.XTokensTransferredMultiCurrenciesEvent = exports.XTokensTransferredMultiAssetsEvent = exports.XTokensTransferredMultiAssetWithFeeEvent = exports.TokensTransferEvent = void 0;
const assert_1 = __importDefault(require("assert"));
const support_1 = require("./support");
class TokensTransferEvent {
    constructor(ctx) {
        this.ctx = ctx;
        (0, assert_1.default)(this.ctx.event.name === 'tokens.Transfer');
    }
    /**
     *  Transfer succeeded. \[currency_id, from, to, value\]
     */
    get isV1() {
        return this.ctx._chain.getEventHash('tokens.Transfer') === '687592af47ed25da7cb1782c7d3ab850f2643203e3a3d46a2f3f2413ed94da71';
    }
    /**
     *  Transfer succeeded. \[currency_id, from, to, value\]
     */
    get asV1() {
        (0, assert_1.default)(this.isV1);
        return this.ctx._chain.decodeEvent(this.ctx.event);
    }
    /**
     * Transfer succeeded. \[currency_id, from, to, value\]
     */
    get isV6() {
        return this.ctx._chain.getEventHash('tokens.Transfer') === 'fdaae151bb8b36a8d8ad740d8c981614f3554e661a6028bab9b8ca624adaac32';
    }
    /**
     * Transfer succeeded. \[currency_id, from, to, value\]
     */
    get asV6() {
        (0, assert_1.default)(this.isV6);
        return this.ctx._chain.decodeEvent(this.ctx.event);
    }
    /**
     * Transfer succeeded.
     */
    get isV10() {
        return this.ctx._chain.getEventHash('tokens.Transfer') === 'b10834d910d905da35363fe42f3bbd9db5dfbc13064a482a7c8c57bb3c9a8e68';
    }
    /**
     * Transfer succeeded.
     */
    get asV10() {
        (0, assert_1.default)(this.isV10);
        return this.ctx._chain.decodeEvent(this.ctx.event);
    }
    /**
     * Transfer succeeded.
     */
    get isV15() {
        return this.ctx._chain.getEventHash('tokens.Transfer') === '41417e5ccc760096c9529f3ff9dcfe27e94b23a733432b671ed451e2ff362dcc';
    }
    /**
     * Transfer succeeded.
     */
    get asV15() {
        (0, assert_1.default)(this.isV15);
        return this.ctx._chain.decodeEvent(this.ctx.event);
    }
    get isLatest() {
        (0, support_1.deprecateLatest)();
        return this.isV15;
    }
    get asLatest() {
        (0, support_1.deprecateLatest)();
        return this.asV15;
    }
}
exports.TokensTransferEvent = TokensTransferEvent;
class XTokensTransferredMultiAssetWithFeeEvent {
    constructor(ctx) {
        this.ctx = ctx;
        (0, assert_1.default)(this.ctx.event.name === 'xTokens.TransferredMultiAssetWithFee');
    }
    /**
     * Transferred `MultiAsset` with fee.
     */
    get isV10() {
        return this.ctx._chain.getEventHash('xTokens.TransferredMultiAssetWithFee') === 'cba4a5ec13032868bc74df82888767ea7fd34969b190ec1e6086219a80e5ee72';
    }
    /**
     * Transferred `MultiAsset` with fee.
     */
    get asV10() {
        (0, assert_1.default)(this.isV10);
        return this.ctx._chain.decodeEvent(this.ctx.event);
    }
    get isLatest() {
        (0, support_1.deprecateLatest)();
        return this.isV10;
    }
    get asLatest() {
        (0, support_1.deprecateLatest)();
        return this.asV10;
    }
}
exports.XTokensTransferredMultiAssetWithFeeEvent = XTokensTransferredMultiAssetWithFeeEvent;
class XTokensTransferredMultiAssetsEvent {
    constructor(ctx) {
        this.ctx = ctx;
        (0, assert_1.default)(this.ctx.event.name === 'xTokens.TransferredMultiAssets');
    }
    /**
     * Transferred `MultiAsset` with fee.
     */
    get isV10() {
        return this.ctx._chain.getEventHash('xTokens.TransferredMultiAssets') === 'f7bab399e6ba944b4e125eae381fe361968f8e894d499e45a921bf53ae4632d8';
    }
    /**
     * Transferred `MultiAsset` with fee.
     */
    get asV10() {
        (0, assert_1.default)(this.isV10);
        return this.ctx._chain.decodeEvent(this.ctx.event);
    }
    /**
     * Transferred `MultiAsset` with fee.
     */
    get isV11() {
        return this.ctx._chain.getEventHash('xTokens.TransferredMultiAssets') === '19a61ff727b39e06bdac9248dc278a5be6292a6af670958a6338915a3e003249';
    }
    /**
     * Transferred `MultiAsset` with fee.
     */
    get asV11() {
        (0, assert_1.default)(this.isV11);
        return this.ctx._chain.decodeEvent(this.ctx.event);
    }
    get isLatest() {
        (0, support_1.deprecateLatest)();
        return this.isV11;
    }
    get asLatest() {
        (0, support_1.deprecateLatest)();
        return this.asV11;
    }
}
exports.XTokensTransferredMultiAssetsEvent = XTokensTransferredMultiAssetsEvent;
class XTokensTransferredMultiCurrenciesEvent {
    constructor(ctx) {
        this.ctx = ctx;
        (0, assert_1.default)(this.ctx.event.name === 'xTokens.TransferredMultiCurrencies');
    }
    /**
     * Transferred `MultiAsset` with fee.
     */
    get isV10() {
        return this.ctx._chain.getEventHash('xTokens.TransferredMultiCurrencies') === '5c651358c717f2eafd979f1dfd6ce0304a8da4a8fcc6362b035e0b3f78ceb5b7';
    }
    /**
     * Transferred `MultiAsset` with fee.
     */
    get asV10() {
        (0, assert_1.default)(this.isV10);
        return this.ctx._chain.decodeEvent(this.ctx.event);
    }
    get isLatest() {
        (0, support_1.deprecateLatest)();
        return this.isV10;
    }
    get asLatest() {
        (0, support_1.deprecateLatest)();
        return this.asV10;
    }
}
exports.XTokensTransferredMultiCurrenciesEvent = XTokensTransferredMultiCurrenciesEvent;
class XTokensTransferredWithFeeEvent {
    constructor(ctx) {
        this.ctx = ctx;
        (0, assert_1.default)(this.ctx.event.name === 'xTokens.TransferredWithFee');
    }
    /**
     * Transferred with fee.
     */
    get isV10() {
        return this.ctx._chain.getEventHash('xTokens.TransferredWithFee') === '47fa9c25e9f6b216ac72d5410f695aa27693476acf05f1e675677473043706c7';
    }
    /**
     * Transferred with fee.
     */
    get asV10() {
        (0, assert_1.default)(this.isV10);
        return this.ctx._chain.decodeEvent(this.ctx.event);
    }
    get isLatest() {
        (0, support_1.deprecateLatest)();
        return this.isV10;
    }
    get asLatest() {
        (0, support_1.deprecateLatest)();
        return this.asV10;
    }
}
exports.XTokensTransferredWithFeeEvent = XTokensTransferredWithFeeEvent;
//# sourceMappingURL=events.js.map