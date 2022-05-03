import { BigInt, log, cosmos } from "@graphprotocol/graph-ts";
import {
  BlockID,
  Commit,
  CommitSig,
  Consensus,
  DuplicateVoteEvidence,
  EventVote,
  Evidence,
  EvidenceList,
  Header,
  LightBlock,
  LightClientAttackEvidence,
  PartSetHeader,
  PublicKey,
  ResponseDeliverTx,
  ResponseEndBlock,
  Reward,
  SignedHeader,
  Timestamp,
  TxResult,
  Validator,
  ValidatorSet,
  ValidatorUpdate,
} from "../generated/schema";

export function handleBlock(block: cosmos.Block): void {
  const header = block.header;
  const blockHash = block.header.hash.toHexString();
  const height = BigInt.fromString(header.height.toString());
  const txLen = block.transactions.length;

  for (let index = 0; index < txLen; index++) {
    const txID = `${blockHash}-${index.toString()}`;
    const txResult = block.transactions[index];

    saveResponseDeliverTx(txID, txResult);
    saveTxResult(txID, height, BigInt.fromI32(index), txResult);
  }

  saveEvidenceList(blockHash, block.evidence)
  saveEndBlock(blockHash, block.resultEndBlock);

  log.info("BLOCK {} txs: {}", [height.toString(), txLen.toString()]);
}

function saveBlockID(id: string, bID: cosmos.BlockID): string {
  const blockID = new BlockID(id);
  blockID.hash = bID.hash;
  blockID.partSetHeader = savePartSetHeader(id, bID.partSetHeader);
  blockID.save();
  return id;
}

function savePartSetHeader(id: string, psh: cosmos.PartSetHeader): string {
  const partSetHeader = new PartSetHeader(id);
  partSetHeader.total = BigInt.fromString(psh.total.toString());
  partSetHeader.hash = psh.hash;
  partSetHeader.save();
  return id;
}

function saveHeader(id: string, h: cosmos.Header): string {
  const height = BigInt.fromString(h.height.toString());
  const header = new Header(id);
  header.version = saveVersion(id, h.version);
  header.chainId = h.chainId;
  header.height = height;
  header.time = saveTimestamp(id, h.time);
  header.lastBlockId = h.lastBlockId.hash.toHexString();
  header.lastCommitHash = h.lastCommitHash;
  header.dataHash = h.dataHash;
  header.validatorsHash = h.validatorsHash;
  header.nextValidatorsHash = h.nextValidatorsHash;
  header.consensusHash = h.consensusHash;
  header.appHash = h.appHash;
  header.lastResultsHash = h.lastResultsHash;
  header.evidenceHash = h.evidenceHash;
  header.proposerAddress = h.proposerAddress;
  header.save();
  return id;
}

function saveVersion(id: string, v: cosmos.Consensus): string {
  const version = new Consensus(id);
  version.block = BigInt.fromString(v.block.toString());
  version.app = BigInt.fromString(v.app.toString());
  version.save();
  return id;
}

function saveTimestamp(id: string, ts: cosmos.Timestamp): string {
  const timestamp = new Timestamp(id);
  timestamp.seconds = BigInt.fromString(ts.seconds.toString());
  timestamp.nanos = ts.nanos;
  timestamp.save();
  return id;
}

function saveEvidenceList(id: string, el: cosmos.EvidenceList): string {
  const evidenceList = new EvidenceList(id);
  evidenceList.evidence = saveEvidences(id, el.evidence);
  evidenceList.save();
  return id;
}

function saveEvidences(
    id: string,
    evs: Array<cosmos.Evidence>
): Array<string> {
  let evidenceIDs = new Array<string>(evs.length);
  for (let i = 0; i < evs.length; i++) {
    evidenceIDs[i] = saveEvidence(`${id}-${i}`, evs[i]);
  }
  return evidenceIDs;
}

function saveEvidence(id: string, e: cosmos.Evidence): string {
  const evidence = new Evidence(id);
  if (e.duplicateVoteEvidence !== null) {
    evidence.duplicateVoteEvidence = saveDuplicateVoteEvidence(
        id,
        e.duplicateVoteEvidence
    );
  } else if (e.lightClientAttackEvidence !== null) {
    evidence.lightClientAttackEvidence = saveLightClientAttackEvidence(
        id,
        e.lightClientAttackEvidence
    );
  }
  evidence.save();
  return id;
}

function saveDuplicateVoteEvidence(
    id: string,
    e: cosmos.DuplicateVoteEvidence
): string {
  const duplicateVoteEvidence = new DuplicateVoteEvidence(id);
  duplicateVoteEvidence.voteA = saveEventVote(`${id}-voteA`, e.voteA);
  duplicateVoteEvidence.voteB = saveEventVote(`${id}-voteB`, e.voteA);
  duplicateVoteEvidence.totalVotingPower = BigInt.fromString(
      e.totalVotingPower.toString()
  );
  duplicateVoteEvidence.validatorPower = BigInt.fromString(
      e.validatorPower.toString()
  );
  duplicateVoteEvidence.timestamp = saveTimestamp(id, e.timestamp);
  duplicateVoteEvidence.save();
  return id;
}

function saveEventVote(id: string, ev: cosmos.EventVote): string {
  const eventVote = new EventVote(id);
  eventVote.eventVoteType = ev.eventVoteType.toString();
  eventVote.height = BigInt.fromString(ev.height.toString());
  eventVote.round = ev.round;
  eventVote.blockId = ev.blockId.hash.toHexString();
  eventVote.timestamp = saveTimestamp(id, ev.timestamp);
  eventVote.validatorAddress = ev.validatorAddress;
  eventVote.validatorIndex = ev.validatorIndex;
  eventVote.signature = ev.signature;
  eventVote.save();
  return id;
}

function saveLightClientAttackEvidence(
    id: string,
    e: cosmos.LightClientAttackEvidence
): string {
  const lightClientAttackEvidence = new LightClientAttackEvidence(id);
  lightClientAttackEvidence.conflictingBlock = saveLightBlock(
      id,
      e.conflictingBlock
  );
  lightClientAttackEvidence.save();
  return id;
}

function saveLightBlock(id: string, lb: cosmos.LightBlock): string {
  const lightBlock = new LightBlock(id);
  lightBlock.signedHeader = saveSignedHeader(id, lb.signedHeader);
  lightBlock.validatorSet = saveValidatorSet(id, lb.validatorSet);
  lightBlock.save();
  return id;
}

function saveSignedHeader(id: string, sh: cosmos.SignedHeader): string {
  const signedHeader = new SignedHeader(id);
  signedHeader.header = saveHeader(id, sh.header);
  signedHeader.commit = saveCommit(id, sh.commit);
  signedHeader.save();
  return id;
}

function saveValidatorSet(id: string, sh: cosmos.ValidatorSet): string {
  const validatorSet = new ValidatorSet(id);
  validatorSet.validators = saveValidators(id, sh.validators);
  validatorSet.proposer = saveValidator(id, sh.proposer);
  validatorSet.totalVotingPower = BigInt.fromString(
      sh.totalVotingPower.toString()
  );
  validatorSet.save();
  return id;
}

function saveValidators(
    id: string,
    validators: Array<cosmos.Validator>
): Array<string> {
  let validatorIDs = new Array<string>(validators.length);
  for (let i = 0; i < validators.length; i++) {
    validatorIDs[i] = saveValidator(`${id}-${i}`, validators[i]);
  }
  return validatorIDs;
}

function saveValidator(id: string, v: cosmos.Validator): string {
  const validator = new Validator(id);
  validator.address = v.address;
  validator.votingPower = BigInt.fromString(v.votingPower.toString());
  validator.proposerPriority = BigInt.fromString(
      v.proposerPriority.toString()
  );
  validator.pubKey = savePublicKey(v.address.toHexString(), v.pubKey);
  validator.save();
  return id;
}

function saveCommit(id: string, c: cosmos.Commit): string {
  const commit = new Commit(id);
  commit.height = BigInt.fromString(c.height.toString());
  commit.round = c.round;
  commit.blockId = saveBlockID(c.blockId.hash.toHexString(), c.blockId);
  commit.signatures = saveCommitSigs(id, c.signatures);
  commit.save();
  return id;
}

function saveCommitSigs(
    id: string,
    cs: Array<cosmos.CommitSig>
): Array<string> {
  let commitSigIDs = new Array<string>(cs.length);
  for (let i = 0; i < cs.length; i++) {
    commitSigIDs[i] = saveCommitSig(`${id}-${i}`, cs[i]);
  }
  return commitSigIDs;
}

function saveCommitSig(id: string, cs: cosmos.CommitSig): string {
  const commitSig = new CommitSig(id);
  commitSig.blockIdFlag = getBlockIDFlag(cs.blockIdFlag);
  commitSig.validatorAddress = cs.validatorAddress;
  commitSig.timestamp = saveTimestamp(id, cs.timestamp);
  commitSig.signature = cs.signature;
  commitSig.save();
  return id;
}

function getBlockIDFlag(bf: cosmos.BlockIDFlag): string {
  switch (bf) {
    case cosmos.BlockIDFlag.BLOCK_ID_FLAG_UNKNOWN:
      return "BLOCK_ID_FLAG_UNKNOWN";
    case cosmos.BlockIDFlag.BLOCK_ID_FLAG_ABSENT:
      return "BLOCK_ID_FLAG_ABSENT";
    case cosmos.BlockIDFlag.BLOCK_ID_FLAG_COMMIT:
      return "BLOCK_ID_FLAG_COMMIT";
    case cosmos.BlockIDFlag.BLOCK_ID_FLAG_NIL:
      return "BLOCK_ID_FLAG_NIL";
    default:
      log.error("unknown blockIdFlag: {}", [bf.toString()]);
      return "unknown";
  }
}

function saveResponseDeliverTx(
    id: string,
    txResult: cosmos.TxResult
): void {
  const responseDeliverTx = new ResponseDeliverTx(id);
  responseDeliverTx.code = new BigInt(txResult.result.code);
  responseDeliverTx.log = txResult.result.log;
  responseDeliverTx.info = txResult.result.info;
  responseDeliverTx.gasWanted = BigInt.fromString(
      txResult.result.gasWanted.toString()
  );
  responseDeliverTx.gasUsed = BigInt.fromString(
      txResult.result.gasUsed.toString()
  );
  responseDeliverTx.codespace = txResult.result.codespace;
  responseDeliverTx.save();
}

function saveTxResult(
    id: string,
    height: BigInt,
    index: BigInt,
    txRes: cosmos.TxResult
): void {
  const txResult = new TxResult(id);
  txResult.height = height;
  txResult.index = index;
  txResult.result = id;
  txResult.save();

  for (let i = 0; i < txRes.tx.body.messages.length; i++) {
    const msg = txRes.tx.body.messages[i];
    log.info("MESSAGE TYPE = {}", [msg.typeUrl])
  }
}

function saveEndBlock(id: string, endBlock: cosmos.ResponseEndBlock): void {
  const responseEndBlock = new ResponseEndBlock(id);
  responseEndBlock.validatorUpdates = saveValidatorUpdates(
      id,
      endBlock.validatorUpdates
  );
  responseEndBlock.consensusParamUpdates = id;
  responseEndBlock.save();
}

function saveValidatorUpdates(
    id: string,
    validators: Array<cosmos.ValidatorUpdate>
): Array<string> {
  let validatorIDs = new Array<string>(validators.length);
  for (let i = 0; i < validators.length; i++) {
    const v = validators[i];
    const address = v.address.toHexString();

    validatorIDs[i] = saveValidatorUpdate(`${id}-${address}`, v);
  }
  return validatorIDs;
}

function saveValidatorUpdate(
    id: string,
    v: cosmos.ValidatorUpdate
): string {
  const validatorUpdate = new ValidatorUpdate(id);
  validatorUpdate.address = v.address;
  validatorUpdate.pubKey = savePublicKey(v.address.toHexString(), v.pubKey);
  validatorUpdate.power = BigInt.fromString(v.power.toString());
  validatorUpdate.save();
  return id;
}

function savePublicKey(id: string, publicKey: cosmos.PublicKey): string {
  let pk = PublicKey.load(id);
  if (pk !== null) {
    log.debug("Validator with id: {} already exists", [id]);
    return id;
  }

  pk = new PublicKey(id);
  pk.ed25519 = publicKey.ed25519;
  pk.secp256k1 = publicKey.secp256k1;
  pk.save();
  return id;
}

export function handleReward(eventData: cosmos.EventData): void {
  const height = eventData.block.header.height;
  const amount = eventData.event.attributes[0].value;
  const validator = eventData.event.attributes[1].value;

  let reward = new Reward(`${height}-${validator}`);

  reward.amount = amount;
  reward.validator = validator;

  reward.save();
}
