import { cosmos } from "@graphprotocol/graph-ts";
import { MsgDelegate, MsgCoin, decodeMsgDelegate } from "./decoding";
import { Delegation, Coin } from "../generated/schema";

export function handleMsgDelegate(messageData: cosmos.MessageData): void {
  const message = decodeMsgDelegate(messageData.message.value);
  const id = `${messageData.block.header.hash.toHexString()}-${message.delegator_address}-${message.validator_address}`;

  saveDelegation(id, message);
}

function saveDelegation(id: string, message: MsgDelegate): void {
  const msg = new Delegation(id);
  msg.delegatorAddress = message.delegator_address;
  msg.validatorAddress = message.validator_address;
  msg.amount = saveCoin(id, message.amount as MsgCoin);
  msg.save();
}

function saveCoin(id: string, c: MsgCoin): string {
  const coin = new Coin(id);
  coin.amount = c.amount;
  coin.denom = c.denom;
  coin.save();
  return id;
}
