import { BigInt, cosmos, log } from "@graphprotocol/graph-ts";
import { cosmwasm } from "@graphprotocol/juno-ts";
import { Contract } from "../generated/schema";
import { JSON } from "assemblyscript-json";

export function handleMsgExecuteContract(data: cosmos.MessageData): void {
  const message = cosmwasm.wasm.v1.decodeMsgExecuteContract(data.message.value);
  const id = message.contract;
  let contract = Contract.load(id);

  if (contract == null) {
    contract  = new Contract(id);
    contract.liquidity = BigInt.fromI32(0);
  }

  const jsonMsg = <JSON.Obj>(JSON.parse(message.msg));

  const add_liquidity = jsonMsg.getObj("add_liquidity");
  if (add_liquidity != null) {
    const amount = add_liquidity.getString("token1_amount");
    if (amount != null) {
      if (validateBigInt(amount.toString())) {
        contract.liquidity = contract.liquidity.plus(BigInt.fromString(amount.toString()));
      } else {
        log.warning("amount in not a valid number: {}", [amount.toString()])
      }
    }
  }

  const remove_liquidity = jsonMsg.getObj("remove_liquidity");
  if (remove_liquidity != null) {
    const amount = remove_liquidity.getString("amount");
    if (amount != null) {
      if (validateBigInt(amount.toString())) {
        contract.liquidity = contract.liquidity.minus(BigInt.fromString(amount.toString()));
      } else {
        log.warning("amount in not a valid number: {}", [amount.toString()])
      }
    }
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
