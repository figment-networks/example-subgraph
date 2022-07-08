# Cosmoshub Validator Delegations Example

This example subgraph stores `Delegation` objects that represent delegations being made in the Cosmos Hub chain. In order to do that, the handler function decode `/cosmos.staking.v1beta1.MsgDelegate` messages.

## Querying the subgraph

With the following query you can retrieve all the delegations made to the [Figment](https://atomscan.com/validators/cosmosvaloper1hjct6q7npsspsg3dgvzk3sdf89spmlpfdn6m9d) validator, and the amounts of each of the delegations:

```
query ValidatorDelegations($validatorAddress: String!) {
  delegations(where: {validatorAddress: $validatorAddress}) {
    validatorAddress,
    delegatorAddress,
    amount {
      amount,
      denom
    }
  }
}
```
```
{
    "validatorAddress": "cosmosvaloper1hjct6q7npsspsg3dgvzk3sdf89spmlpfdn6m9d"
}
```

For more information see the docs on https://thegraph.com/docs/.
