# Osmosis data dump

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

## Query subgraph

```bash
{
  block(id: "5200793") {
    id
    header {
      id
      version {
        id
        block
        app
      }
      chainId
      height
      time {
        id
        seconds
        nanos
      }
      lastBlockId {
        id
        hash
        partSetHeader {
          id
          total
          hash
        }
      }
      lastCommitHash
      dataHash
      validatorsHash
      nextValidatorsHash
      consensusHash
      appHash
      lastResultsHash
      evidenceHash
      proposerAddress
      hash
    }
    evidence {
      id
      evidence {
        duplicateVoteEvidence {
          id
          voteA {
            id
            eventVoteType
            height
            round
            blockId {
              id
              hash
              partSetHeader {
                id
                total
                hash
              }
            }
            timestamp {
              id
              seconds
              nanos
            }
            validatorAddress
            validatorIndex
            signature
          }
          voteB {
            id
            eventVoteType
            height
            round
            blockId {
              id
              hash
              partSetHeader {
                id
                total
                hash
              }
            }
            timestamp {
              id
              seconds
              nanos
            }
            validatorAddress
            validatorIndex
            signature
          }
          totalVotingPower
          validatorPower
          timestamp {
            id
            seconds
            nanos
          }
        }
        lightClientAttackEvidence {
          id
          conflictingBlock {
            id
            signedHeader {
              id
              header {
                id
                version {
                  id
                  block
                  app
                }
                chainId
                height
                time {
                  id
                  seconds
                  nanos
                }
                lastBlockId {
                  id
                  hash
                  partSetHeader {
                    id
                    total
                    hash
                  }
                }
                lastCommitHash
                dataHash
                validatorsHash
                nextValidatorsHash
                consensusHash
                appHash
                lastResultsHash
                evidenceHash
                proposerAddress
                hash
              }
            }
            validatorSet {
              id
              validators {
                id
                address
                pubKey {
                  id
                  ed25519
                  secp256k1
                }
                votingPower
                proposerPriority
              }
              proposer {
                id
                address
                pubKey {
                  id
                  ed25519
                  secp256k1
                }
                votingPower
                proposerPriority
              }
              totalVotingPower
            }
          }
          commonHeight
          byzantineValidators {
            id
            address
            pubKey {
              id
              ed25519
              secp256k1
            }
            votingPower
            proposerPriority
          }
          totalVotingPower
          timestamp {
            id
            seconds
            nanos
          }
        }
      }
    }
    lastCommit {
      id
      height
      round
      blockId {
        id
        hash
        partSetHeader {
          id
        }
      }
      signatures {
        id
        blockIdFlag
        validatorAddress
        timestamp {
          id
          seconds
          nanos
        }
        signature
      }
    }
    resultEndBlock {
      id
      validatorUpdates {
        id
        address
        pubKey {
          id
          ed25519
          secp256k1
        }
        power
      }
      consensusParamUpdates {
        id
        block {
          id
          maxBytes
          maxGas
        }
        evidence {
          id
          maxAgeNumBlocks
          maxAgeDuration {
            id
          }
          maxBytes
        }
        validator {
          id
          pubKeyTypes
        }
        version {
          id
          appVersion
        }
      }
    }
    transactions {
      id
      height
      index
      tx {
        id
        body {
          id
          messages {
            id
            index
            typeUrl
          }
          memo
          timeoutHeight
          extensionOptions {
            id
            index
            typeUrl
          }
          nonCriticalExtensionOptions {
            id
            index
            typeUrl
          }
        }
        authInfo {
          id
          signerInfos {
            id
            publicKey {
              id
              typeUrl
            }
            modeInfo {
              id
              single {
                id
                mode
              }
              multi {
                id
                bitarray {
                  id
                  extraBitsStored
                  elems
                }
                modeInfos {
                  id
                  single {
                    id
                    mode
                  }
                  multi {
                    id
                    bitarray {
                      id
                      extraBitsStored
                      elems
                    }
                  }
                }
              }
            }
            sequence
          }
          fee {
            amount {
              id
              denom
              amount
            }
            gasLimit
            payer
            granter
          }
          tip {
            amount {
              id
              denom
              amount
            }
            tipper
          }
        }
        signatures
      }
      result {
        id
        code
        data
        log
        info
        gasWanted
        gasUsed
        codespace
      }
      hash
    }
    validatorUpdates {
      id
      address
      pubKey {
        id
      }
      votingPower
      proposerPriority
    }
  }
}
```