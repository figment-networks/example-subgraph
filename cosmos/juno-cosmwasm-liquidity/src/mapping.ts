import { json, BigInt, cosmos, log, Bytes, typeConversion } from "@graphprotocol/graph-ts";
import { cosmwasm } from "@graphprotocol/juno-ts";
import { Contract } from "../generated/schema";


export function handleMsgExecuteContract(data: cosmos.MessageData): void {
  const message = cosmwasm.wasm.v1.decodeMsgExecuteContract(data.message.value);
  const id = message.contract;
  let contract = Contract.load(id);

  if (contract == null) {
    contract  = new Contract(id);
    contract.liquidity = BigInt.fromI32(0);
  }

  const result = json.try_fromBytes(Bytes.fromUint8Array(message.msg));

  if (result.isOk) {
    const jsonMsg = result.value;
    const add_liquidity = jsonMsg.toObject().getEntry("add_liquidity");
    if (add_liquidity != null) {
      const amount = add_liquidity.value.toObject().getEntry("token1_amount");
      if (amount != null) {
        if (validateBigInt(amount.value.toString())) {
          contract.liquidity = contract.liquidity.plus(BigInt.fromString(amount.value.toString()));
        } else {
          log.warning("amount in not a valid number: {}", [amount.value.toString()])
        }
      }
    }

    const remove_liquidity = jsonMsg.toObject().getEntry("remove_liquidity");
    if (remove_liquidity != null) {
      const amount = remove_liquidity.value.toObject().getEntry("amount");
      if (amount != null) {
        if (validateBigInt(amount.value.toString())) {
          contract.liquidity = contract.liquidity.minus(BigInt.fromString(amount.value.toString()));
        } else {
          log.warning("amount in not a valid number: {}", [amount.value.toString()])
        }
      }
    }
  } else {
    log.warning("MsgExecuteContract.msg is not a valid json object: {}", [typeConversion.bytesToString(message.msg)])
  }

  contract.save();
}

function validateBigInt(str: string): boolean
{
  for(let i = 0; i < str.length; i++) {
    const num = parseInt(str[i])
    if (num == NaN) {
      return false;
    }
  };

  return true;
}
