"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var BigNumber = require("bignumber.js");
var payment_channel_1 = require("./payment_channel");
var events_1 = require("events");
var mutex_1 = require("./util/mutex");
var log_1 = require("./util/log");
var LOG = log_1["default"]('ChannelManager');
var DAY_IN_SECONDS = 86400;
/** Default settlement period for a payment channel */
exports.DEFAULT_SETTLEMENT_PERIOD = 2 * DAY_IN_SECONDS;
var ChannelManagerImpl = /** @class */ (function (_super) {
    __extends(ChannelManagerImpl, _super);
    function ChannelManagerImpl(account, web3, channelsDao, paymentsDao, tokensDao, channelContract, paymentManager) {
        var _this = _super.call(this) || this;
        _this.mutex = new mutex_1["default"]();
        _this.account = account;
        _this.web3 = web3;
        _this.channelsDao = channelsDao;
        _this.paymentsDao = paymentsDao;
        _this.tokensDao = tokensDao;
        _this.channelContract = channelContract;
        _this.paymentManager = paymentManager;
        return _this;
    }
    ChannelManagerImpl.prototype.openChannel = function (sender, receiver, amount, minDepositAmount) {
        var _this = this;
        return this.mutex.synchronize(function () { return _this.internalOpenChannel(sender, receiver, amount, minDepositAmount); });
    };
    ChannelManagerImpl.prototype.closeChannel = function (channelId, provider) {
        var _this = this;
        return this.mutex.synchronize(function () { return _this.internalCloseChannel(channelId, provider); });
    };
    ChannelManagerImpl.prototype.nextPayment = function (channelId, amount, meta) {
        var _this = this;
        return this.mutex.synchronize(function () { return __awaiter(_this, void 0, void 0, function () {
            var channel, toSpend, payment, chan;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.channelById(channelId)];
                    case 1:
                        channel = _a.sent();
                        if (!channel) {
                            throw new Error("Channel with id " + channelId.toString() + " not found.");
                        }
                        toSpend = channel.spent.add(amount);
                        if (toSpend.greaterThan(channel.value)) {
                            throw new Error("Total spend " + toSpend.toString() + " is larger than channel value " + channel.value.toString());
                        }
                        return [4 /*yield*/, this.paymentManager.buildPaymentForChannel(channel, amount, toSpend, meta)];
                    case 2:
                        payment = _a.sent();
                        chan = payment_channel_1.PaymentChannel.fromPayment(payment);
                        return [4 /*yield*/, this.channelsDao.saveOrUpdate(chan)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, payment];
                }
            });
        }); });
    };
    ChannelManagerImpl.prototype.acceptPayment = function (payment) {
        var _this = this;
        LOG("Queueing payment of " + payment.price.toString() + " Wei to channel with ID " + payment.channelId + ".");
        return this.mutex.synchronize(function () { return __awaiter(_this, void 0, void 0, function () {
            var channel, valid, existingChannel, token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        channel = payment_channel_1.PaymentChannel.fromPayment(payment);
                        LOG("Adding " + payment.price.toString() + " Wei to channel with ID " + channel.channelId.toString() + ".");
                        return [4 /*yield*/, this.paymentManager.isValid(payment, channel)];
                    case 1:
                        valid = _a.sent();
                        if (!!valid) return [3 /*break*/, 5];
                        LOG("Received invalid payment from " + payment.sender + "!");
                        return [4 /*yield*/, this.channelsDao.findBySenderReceiverChannelId(payment.sender, payment.receiver, payment.channelId)];
                    case 2:
                        existingChannel = _a.sent();
                        if (!existingChannel) return [3 /*break*/, 4];
                        LOG("Found existing channel with id " + payment.channelId + " between " + payment.sender + " and " + payment.receiver + ".");
                        LOG('Closing channel due to malfeasance.');
                        return [4 /*yield*/, this.internalCloseChannel(channel.channelId)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: throw new Error('Invalid payment.');
                    case 5:
                        token = this.web3.sha3(JSON.stringify(payment)).toString();
                        return [4 /*yield*/, this.channelsDao.saveOrUpdate(channel)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.tokensDao.save(token, payment.channelId)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.paymentsDao.save(token, payment)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/, token];
                }
            });
        }); });
    };
    ChannelManagerImpl.prototype.requireOpenChannel = function (sender, receiver, amount, minDepositAmount) {
        var _this = this;
        return this.mutex.synchronize(function () {
            return _this.channelsDao.findUsable(sender, receiver, amount).then(function (channel) {
                return channel || _this.internalOpenChannel(sender, receiver, amount, minDepositAmount);
            });
        });
    };
    ChannelManagerImpl.prototype.channels = function () {
        return this.channelsDao.all();
    };
    ChannelManagerImpl.prototype.openChannels = function () {
        return this.channelsDao.allOpen();
    };
    ChannelManagerImpl.prototype.channelById = function (channelId) {
        return this.channelsDao.firstById(channelId);
    };
    ChannelManagerImpl.prototype.verifyToken = function (token) {
        return this.tokensDao.isPresent(token);
    };
    ChannelManagerImpl.prototype.internalOpenChannel = function (sender, receiver, amount, minDepositAmount) {
        var _this = this;
        //specify the minimum deposit amount required to open the payment channel
        var depositAmount = amount.times(5);
        if (minDepositAmount.greaterThan(0) && minDepositAmount.greaterThan(depositAmount)) {
            depositAmount = minDepositAmount;
        }
        this.emit('willOpenChannel', sender, receiver, depositAmount);
        return this.buildChannel(sender, receiver, depositAmount, exports.DEFAULT_SETTLEMENT_PERIOD)
            .then(function (paymentChannel) { return _this.channelsDao.save(paymentChannel).then(function () { return paymentChannel; }); })
            .then(function (paymentChannel) {
            _this.emit('didOpenChannel', paymentChannel);
            return paymentChannel;
        });
    };
    ChannelManagerImpl.prototype.internalCloseChannel = function (channelId, provider) {
        var _this = this;
        return this.channelById(channelId).then(function (channel) {
            if (!channel) {
                throw new Error("Channel with id " + channelId.toString() + " not found.");
            }
            _this.emit('willCloseChannel', channel);
            var res;
            if (channel.sender === _this.account) {
                res = _this.settle(channel);
            }
            else {
                res = _this.claim(channel, provider);
            }
            return res.then(function (txn) {
                _this.emit('didCloseChannel', channel);
                return txn;
            });
        });
    };
    ChannelManagerImpl.prototype.settle = function (channel) {
        var _this = this;
        return this.channelContract.getState(channel.channelId).then(function (state) {
            if (state === 2) {
                throw new Error("Channel " + channel.channelId.toString() + " is already settled.");
            }
            switch (state) {
                case 0:
                    return _this.channelContract.startSettle(_this.account, channel.channelId)
                        .then(function (res) { return _this.channelsDao.updateState(channel.channelId, 1).then(function () { return res; }); });
                case 1:
                    return _this.channelContract.finishSettle(_this.account, channel.channelId)
                        .then(function (res) { return _this.channelsDao.updateState(channel.channelId, 2).then(function () { return res; }); });
                default:
                    throw new Error("Unknown state: " + state);
            }
        });
    };
    ChannelManagerImpl.prototype.claim = function (channel, provider) {
        var _this = this;
        return this.paymentsDao.firstMaximum(channel.channelId).then(function (payment) {
            if (!payment) {
                throw new Error("No payment found for channel ID " + channel.channelId.toString());
            }
            return _this.channelContract.claim(channel.receiver, channel.channelId, payment.value, payment.signature, provider)
                .then(function (res) { return _this.channelsDao.updateState(channel.channelId, 2).then(function () { return res; }); });
        });
    };
    ChannelManagerImpl.prototype.buildChannel = function (sender, receiver, price, settlementPeriod) {
        return __awaiter(this, void 0, void 0, function () {
            var res, channelId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.channelContract.open(sender, receiver, price, settlementPeriod)];
                    case 1:
                        res = _a.sent();
                        channelId = res.logs[0].args.channelId;
                        return [2 /*return*/, new payment_channel_1.PaymentChannel(sender, receiver, channelId, price, new BigNumber.BigNumber(0), 0, undefined)];
                }
            });
        });
    };
    return ChannelManagerImpl;
}(events_1.EventEmitter));
exports.ChannelManagerImpl = ChannelManagerImpl;
