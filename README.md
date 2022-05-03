# subgraph-cosmos-example

## Setup

1. Run ingestor

```bash
git clone https://github.com/figment-networks/ingestor-tendermint.git
```

2. Run graph-node

```bash
git clone https://github.com/figment-networks/graph-node.git
```

3. Run gaia

```bash
git clone https://github.com/figment-networks/gaia.git
```

## Build

```bash
yarn
yarn codegen
yarn build
```

## Create subgraph

```bash
yarn create-local
```

## Deploy subgraph

```bash
yarn deploy-local
```
