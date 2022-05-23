# Cosmos Data Dump Example Subgraph

This example subgraph decodes full blocks using all available proto definitions and saves them to the subgraph store. The following steps will setup a local firehose instance and deploy the example subgraph. This can also be done using a firehose instance deployed to the hosted service.

## Setup Local Firehose

1. Clone firehose-cosmos

```bash
git clone https://github.com/figment-networks/firehose-cosmos.git
```

2. Run the bootstrap script to download gaia and setup the gaia home directory

```bash
cd firehose-cosmos/devel/cosmoshub4
./boostrap.sh
```

In case if you'd like to reset your local copy, remove the `./tmp` directory, or
run the script with an extra environment variable:

```bash
CLEANUP=1 ./bootstrap.sh
```

3. After bootstrapping is complete, start the firehose:

```bash
./start.sh
```

This will start the node from genesis, so give it some time until it start syncing.

You may check on the node's status (if its running) by opening `http://localhost:26657/status` in your browser.

## Build the subgraph

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
The subgraph can be queried though the endpoint: 

http://localhost:8000/subgraphs/name/cosmos-data-dump-example/graphql

The query will print all saved data from a block given its height.
```

```bash
{
  block(id: "5200793") {
    id
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
                address,
                votingPower,
                proposerPriority,
                pubKey {
                  ed25519,
                  secp256k1
                }
              },
              proposer {
                address,
                votingPower,
                proposerPriority,
                pubKey {
                  ed25519,
                  secp256k1
                }
              },
              totalVotingPower
            }
          }
          commonHeight
          byzantineValidators {
            address,
            votingPower,
            proposerPriority,
            pubKey {
              ed25519,
              secp256k1
            }
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
        eventType,
        attributes {
          key,
          value,
          index
        }
      }
    }
    resultEndBlock {
      validatorUpdates {
        address,
        pubKey {
    			ed25519,
    			secp256k1
        },
        power
      },
      consensusParamUpdates {
        block {
          maxBytes,
          maxGas
        },
        evidence {
          maxAgeNumBlocks,
          maxAgeDuration {
            seconds,
            nanos
          },
          maxBytes
        },
        validator {
          pubKeyTypes
        },
        version {
          appVersion
        }
      },
      events {
      	eventType,
        attributes {
          key,
          value,
          index
        }
      }
    }
    transactions {
      height,
      index,
      tx {
        body {
          messages {
            typeUrl,
            value
          },
          memo,
          timeoutHeight,
          extensionOptions {
            typeUrl,
            value
          },
          nonCriticalExtensionOptions {
            typeUrl,
            value
          }
        },
        authInfo {
          signerInfos {
            publicKey {
              typeUrl,
              value
            },
            modeInfo {
              single {
                mode
              },
              multi {
                bitarray {
                  extraBitsStored,
                  elems
                },
                modeInfos {
                  single {
                    mode
                  },
                  multi {
                    bitarray {
                      extraBitsStored,
                      elems
                    },
                    modeInfos {
                      id
                    }
                  }
                }
              }
            },
            sequence
          },
          fee {
            amount {
              denom,
              amount
            },
            gasLimit,
            payer,
            granter
          },
          tip {
            amount {
              denom,
              amount
            },
            tipper
          }
        },
        signatures
      },
      result {
        code,
        data,
        log,
        info,
        gasWanted,
        gasUsed,
        events {
          eventType,
          attributes {
            key,
            value,
            index
          }
        },
        codespace
      },
      hash
    }
    validatorUpdates {
      address,
      votingPower,
      proposerPriority,
      pubKey {
        ed25519,
        secp256k1
      }
    }
  }
}
```