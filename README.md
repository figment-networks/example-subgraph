# Validator Rewards Example

This example subgraph stores `Reward` objects that represent rewards received by a validator in the Osmosis chain. In order to do that, an event handler is used to filter [reward](https://github.com/osmosis-labs/cosmos-sdk/blob/osmosis-main/x/distribution/spec/06_events.md) events. The type of event to be filtered is specified in the subgraph manifest file. That way, the handler will just receive events of that type.

By running this example subgraph, and with the following query, you can retrieve all the rewards received by the [Figment](https://atomscan.com/validators/osmovaloper1hjct6q7npsspsg3dgvzk3sdf89spmlpf6t4agt) validator, and the amounts of each of the rewards:

```
query ValidatorRewards($validatorAddress: String!) {
  rewards(where: {validator: $validatorAddress}) {
    validator,
    amount
  }
}
```
```
{
    "validatorAddress": "osmovaloper1hjct6q7npsspsg3dgvzk3sdf89spmlpf6t4agt"
}
```
For more information see the docs on https://thegraph.com/docs/.
