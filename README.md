# Cosmos data dump

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
    header {
      version {
        block
        app
      }
      chainId
      height
      time {
        seconds
        nanos
      }
      lastBlockId {
        hash
        partSetHeader {
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
      evidence {
        lightClientAttackEvidence {
          conflictingBlock {
            signedHeader {
              header {
                version {
                  block
                  app
                }
                chainId
                height
                time {
                  seconds
                  nanos
                }
                lastBlockId {
                  hash
                  partSetHeader {
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
              commit {
                height
                round
                blockId {
                  hash
                  partSetHeader {
                    total
                    hash
                  }
                }
                signatures {
                  blockIdFlag
                  validatorAddress
                  timestamp {
                    seconds
                    nanos
                  }
                  signature
                }
              }
            }
            validatorSet {
              validators {
                address
                pubKey {
                  ed25519
                  secp256k1
                }
                votingPower
                proposerPriority
              }
              proposer {
                address
                pubKey {
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
            address
            pubKey {
              ed25519
              secp256k1
            }
            votingPower
            proposerPriority
          }
          totalVotingPower
          timestamp {
            seconds
            nanos
          }
        }
        duplicateVoteEvidence {
          voteA {
            eventVoteType
            height
            round
            blockId {
              hash
              partSetHeader {
                total
                hash
              }
            }
            timestamp {
              seconds
              nanos
            }
            validatorAddress
            validatorIndex
            signature
          }
          voteB {
            eventVoteType
            height
            round
            blockId {
              hash
              partSetHeader {
                total
                hash
              }
            }
            timestamp {
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
            seconds
            nanos
          }
        }
      }
    }
    lastCommit {
      height
      round
      blockId {
        hash
        partSetHeader {
          total
          hash
        }
      }
      signatures {
        blockIdFlag
        validatorAddress
        timestamp {
          seconds
          nanos
        }
        signature
      }
    }
    resultBeginBlock {
      events {
        eventType
        attributes {
          key
          value
          index
        }
      }
    }
    resultEndBlock {
      validatorUpdates {
        address
        pubKey {
          ed25519
          secp256k1
        }
        power
      }
      consensusParamUpdates {
        block {
          maxBytes
          maxGas
        }
        evidence {
          maxAgeNumBlocks
          maxAgeDuration {
            seconds
            nanos
          }
          maxBytes
        }
        validator {
          pubKeyTypes
        }
        version {
          appVersion
        }
      }
      events {
        eventType
        attributes {
          key
          value
          index
        }
      }
    }
    transactions {
      height
      index
      tx {
        body {
          messages {
            index
            typeUrl
          }
          memo
          timeoutHeight
          extensionOptions {
            index
            typeUrl
          }
          nonCriticalExtensionOptions {
            index
            typeUrl
          }
        }
        authInfo {
          signerInfos {
            publicKey {
              typeUrl
            }
            modeInfo {
              single {
                mode
              }
              multi {
                bitarray {
                  extraBitsStored
                  elems
                }
                modeInfos {
                  single {
                    mode
                  }
                  multi {
                    bitarray {
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
              denom
              amount
            }
            gasLimit
            payer
            granter
          }
          tip {
            amount {
              denom
              amount
            }
            tipper
          }
        }
        signatures
      }
      result {
        code
        data
        log
        info
        gasWanted
        gasUsed
        events {
          eventType
          attributes {
            key
            value
            index
          }
        }
      }
      hash
    }
    validatorUpdates {
      address
      pubKey {
        ed25519
        secp256k1
      }
      votingPower
      proposerPriority
    }
  }
}
```