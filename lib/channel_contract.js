"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var uuid = require("uuid");
var log_1 = require("./util/log");
var contracts_1 = require("@machinomy/contracts");
var LOG = log_1["default"]('ChannelContract');
var CREATE_CHANNEL_GAS = 300000;
var ChannelContract = /** @class */ (function () {
    function ChannelContract(web3) {
        this.web3 = web3;
    }
    ChannelContract.generateId = function () {
        return uuid.v4().replace(/-/g, '');
    };
    ChannelContract.prototype.open = function (sender, receiver, price, settlementPeriod) {
        return __awaiter(this, void 0, void 0, function () {
            var deployed, instanceCPU, deployedCPU;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        LOG("Creating channel. Value: " + price + " / Settlement: " + settlementPeriod);
                        return [4 /*yield*/, this.buildChannelContract()];
                    case 1:
                        deployed = _a.sent();
                        if (!(process.env.ERC20CONTRACT_ADDRESS != null)) return [3 /*break*/, 5];
                        return [4 /*yield*/, contracts_1.buildCPUContract(process.env.ERC20CONTRACT_ADDRESS, this.web3)];
                    case 2:
                        instanceCPU = _a.sent();
                        return [4 /*yield*/, instanceCPU.deployed()];
                    case 3:
                        deployedCPU = _a.sent();
                        return [4 /*yield*/, deployedCPU.approve(deployed.address, price, {
                                from: sender,
                                gas: CREATE_CHANNEL_GAS
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, deployed.open(ChannelContract.generateId(), receiver, settlementPeriod, process.env.ERC20CONTRACT_ADDRESS, price, {
                                from: sender,
                                gas: CREATE_CHANNEL_GAS
                            })];
                    case 5: return [2 /*return*/, deployed.open(ChannelContract.generateId(), receiver, settlementPeriod, {
                            from: sender,
                            value: price,
                            gas: CREATE_CHANNEL_GAS
                        })];
                }
            });
        });
    };
    ChannelContract.prototype.claim = function (receiver, channelId, value, signature, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var deployed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        LOG("Claiming channel with id " + channelId + " on behalf of receiver " + receiver);
                        LOG("Values: " + value + " / Signature: " + signature.toString());
                        return [4 /*yield*/, this.buildChannelContract()];
                    case 1:
                        deployed = _a.sent();
                        return [2 /*return*/, deployed.claim(channelId, value, signature.toString(), provider, { from: receiver,
                                gas: CREATE_CHANNEL_GAS })];
                }
            });
        });
    };
    ChannelContract.prototype.deposit = function (sender, channelId, value) {
        return __awaiter(this, void 0, void 0, function () {
            var deployed, instanceCPU, deployedCPU;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        LOG("Depositing " + value + " into channel " + channelId);
                        return [4 /*yield*/, this.buildChannelContract()];
                    case 1:
                        deployed = _a.sent();
                        if (!(process.env.ERC20CONTRACT_ADDRESS != null)) return [3 /*break*/, 5];
                        return [4 /*yield*/, contracts_1.buildCPUContract(process.env.ERC20CONTRACT_ADDRESS, this.web3)];
                    case 2:
                        instanceCPU = _a.sent();
                        return [4 /*yield*/, instanceCPU.deployed()];
                    case 3:
                        deployedCPU = _a.sent();
                        return [4 /*yield*/, deployedCPU.approve(deployed.address, value, {
                                from: sender,
                                gas: CREATE_CHANNEL_GAS
                            })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, deployed.deposit(channelId, value, {
                                from: sender,
                                gas: CREATE_CHANNEL_GAS
                            })];
                    case 5: return [2 /*return*/, deployed.deposit(channelId, {
                            from: sender,
                            value: value,
                            gas: CREATE_CHANNEL_GAS
                        })];
                }
            });
        });
    };
    ChannelContract.prototype.getState = function (channelId) {
        return __awaiter(this, void 0, void 0, function () {
            var deployed, isOpen, isSettling;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        LOG("Fetching state for channel " + channelId);
                        return [4 /*yield*/, this.buildChannelContract()];
                    case 1:
                        deployed = _a.sent();
                        return [4 /*yield*/, deployed.isOpen(channelId)];
                    case 2:
                        isOpen = _a.sent();
                        isSettling = false;
                        if (isOpen) {
                            return [2 /*return*/, 0];
                        }
                        if (isSettling) {
                            return [2 /*return*/, 1];
                        }
                        return [2 /*return*/, 2];
                }
            });
        });
    };
    ChannelContract.prototype.startSettle = function (account, channelId) {
        return __awaiter(this, void 0, void 0, function () {
            var deployed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        LOG("Starting settle for account " + account + " and channel id " + channelId + ".");
                        return [4 /*yield*/, this.buildChannelContract()];
                    case 1:
                        deployed = _a.sent();
                        return [2 /*return*/, deployed.startSettling(channelId, { from: account })];
                }
            });
        });
    };
    ChannelContract.prototype.finishSettle = function (account, channelId) {
        return __awaiter(this, void 0, void 0, function () {
            var deployed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        LOG("Finishing settle for account " + account + " and channel ID " + channelId + ".");
                        return [4 /*yield*/, this.buildChannelContract()];
                    case 1:
                        deployed = _a.sent();
                        return [2 /*return*/, deployed.settle(channelId, { from: account, gas: 400000 })];
                }
            });
        });
    };
    ChannelContract.prototype.paymentDigest = function (channelId, value) {
        return __awaiter(this, void 0, void 0, function () {
            var deployed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.buildChannelContract()];
                    case 1:
                        deployed = _a.sent();
                        return [2 /*return*/, deployed.paymentDigest(channelId, value)];
                }
            });
        });
    };
    ChannelContract.prototype.canClaim = function (channelId, payment, receiver, signature) {
        return __awaiter(this, void 0, void 0, function () {
            var deployed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.buildChannelContract()];
                    case 1:
                        deployed = _a.sent();
                        return [2 /*return*/, deployed.canClaim(channelId, payment, receiver, signature.toString())];
                }
            });
        });
    };
    ChannelContract.prototype.buildChannelContract = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!(process.env.ERC20CONTRACT_ADDRESS != null)) return [3 /*break*/, 5];
                        _a = this;
                        if (!process.env.CONTRACT_ADDRESS) return [3 /*break*/, 2];
                        return [4 /*yield*/, contracts_1.TokenUnidirectional.contract(this.web3.currentProvider).at(process.env.CONTRACT_ADDRESS)];
                    case 1:
                        _b = _e.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, contracts_1.TokenUnidirectional.contract(this.web3.currentProvider).deployed()];
                    case 3:
                        _b = _e.sent();
                        _e.label = 4;
                    case 4:
                        _a._contract = _b;
                        LOG("" + this._contract.address);
                        return [2 /*return*/, this._contract];
                    case 5:
                        _c = this;
                        if (!process.env.CONTRACT_ADDRESS) return [3 /*break*/, 7];
                        return [4 /*yield*/, contracts_1.Unidirectional.contract(this.web3.currentProvider).at(process.env.CONTRACT_ADDRESS)];
                    case 6:
                        _d = _e.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, contracts_1.Unidirectional.contract(this.web3.currentProvider).deployed()];
                    case 8:
                        _d = _e.sent();
                        _e.label = 9;
                    case 9:
                        _c._contract = _d;
                        LOG("" + this._contract.address);
                        return [2 /*return*/, this._contract];
                }
            });
        });
    };
    return ChannelContract;
}());
exports["default"] = ChannelContract;
