import * as BigNumber from 'bignumber.js';
import ChainManager from './chain_manager';
import { PaymentChannel } from './payment_channel';
import Payment from './payment';
import ChannelContract from './channel_contract';
export default class PaymentManager {
    private chainManager;
    private channelContract;
    constructor(chainManager: ChainManager, channelContract: ChannelContract);
    buildPaymentForChannel(channel: PaymentChannel, price: BigNumber.BigNumber, totalValue: BigNumber.BigNumber, meta: string): Promise<Payment>;
    isValid(payment: Payment, paymentChannel: PaymentChannel): Promise<boolean>;
}
