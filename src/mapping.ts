import { BigInt, log, cosmos } from "@graphprotocol/graph-ts";
import {
  Block,
  Header,
  Consensus,
  Timestamp,
  BlockID,
  PartSetHeader,
  EvidenceList,
  Evidence,
  DuplicateVoteEvidence,
  EventVote,
  LightClientAttackEvidence,
  LightBlock,
  SignedHeader,
  Commit,
  CommitSig,
  ValidatorSet,
  Validator,
  PublicKey,
  ResponseBeginBlock,
  Event,
  EventAttribute,
  ResponseEndBlock,
  ValidatorUpdate,
  ConsensusParams,
  BlockParams,
  EvidenceParams,
  Duration,
  ValidatorParams,
  VersionParams,
  TxResult,
  Tx,
  TxBody,
  Any,
  AuthInfo,
  SignerInfo,
  ModeInfo,
  ModeInfoSingle,
  ModeInfoMulti,
  CompactBitArray,
  Fee,
  Coin,
  Tip,
  ResponseDeliverTx,
} from "../generated/schema";

export function handleBlock(block: cosmos.Block): void {
  saveBlock(block.header.height.toString(), block);
}

function saveBlock(id: string, b: cosmos.Block): void {
  const block = new Block(id);
  block.header = saveHeader(id, b.header);
  block.evidence = saveEvidenceList(id, b.evidence);
  block.lastCommit = saveCommit(id, b.lastCommit);
  block.resultBeginBlock = saveResponseBeginBlock(id, b.resultBeginBlock);
  block.resultEndBlock = saveResponseEndBlock(id, b.resultEndBlock);
  block.transactions = saveTxResults(id, b.transactions);
  block.validatorUpdates = saveValidators(id, b.validatorUpdates);
  block.save();
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
  header.lastBlockId = saveBlockID(id, h.lastBlockId);
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

function getSignedMsgType(signedMsgType: cosmos.SignedMsgType): string {
  switch (signedMsgType) {
    case cosmos.SignedMsgType.SIGNED_MSG_TYPE_UNKNOWN:
      return "SIGNED_MSG_TYPE_UNKNOWN";
    case cosmos.SignedMsgType.SIGNED_MSG_TYPE_PREVOTE:
      return "SIGNED_MSG_TYPE_PREVOTE";
    case cosmos.SignedMsgType.SIGNED_MSG_TYPE_PRECOMMIT:
      return "SIGNED_MSG_TYPE_PRECOMMIT";
    case cosmos.SignedMsgType.SIGNED_MSG_TYPE_PROPOSAL:
      return "SIGNED_MSG_TYPE_PROPOSAL";
    default:
      log.error("unknown signedMsgType: {}", [signedMsgType.toString()]);
      return "unknown";
  }
}

function saveEventVote(id: string, ev: cosmos.EventVote): string {
  const eventVote = new EventVote(id);
  eventVote.eventVoteType = getSignedMsgType(ev.eventVoteType);
  eventVote.height = BigInt.fromString(ev.height.toString());
  eventVote.round = ev.round;
  eventVote.blockId = saveBlockID(id, ev.blockId);
  eventVote.timestamp = saveTimestamp(id, ev.timestamp);
  eventVote.validatorAddress = ev.validatorAddress;
  eventVote.validatorIndex = ev.validatorIndex;
  eventVote.signature = ev.signature;
  eventVote.save();
  return id;
}

function saveLightClientAttackEvidence(id: string, e: cosmos.LightClientAttackEvidence): string {
  const lightClientAttackEvidence = new LightClientAttackEvidence(id);
  lightClientAttackEvidence.conflictingBlock = saveLightBlock(id, e.conflictingBlock);
  lightClientAttackEvidence.commonHeight = BigInt.fromString(e.commonHeight.toString());
  lightClientAttackEvidence.byzantineValidators = saveValidators(id, e.byzantineValidators);
  lightClientAttackEvidence.totalVotingPower = BigInt.fromString(e.totalVotingPower.toString());
  lightClientAttackEvidence.timestamp = saveTimestamp(id, e.timestamp);
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
  validatorSet.totalVotingPower = BigInt.fromString(sh.totalVotingPower.toString());
  validatorSet.save();
  return id;
}

function saveValidators(id: string, validators: Array<cosmos.Validator>): Array<string> {
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
  validator.proposerPriority = BigInt.fromString(v.proposerPriority.toString());
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

function saveResponseDeliverTx(id: string, rd: cosmos.ResponseDeliverTx): string {
  const responseDeliverTx = new ResponseDeliverTx(id);
  responseDeliverTx.code = BigInt.fromString(rd.code.toString());
  responseDeliverTx.data = rd.data;
  responseDeliverTx.log = rd.log;
  responseDeliverTx.info = rd.info;
  responseDeliverTx.gasWanted = BigInt.fromString(rd.gasWanted.toString());
  responseDeliverTx.gasUsed = BigInt.fromString(rd.gasUsed.toString());
  responseDeliverTx.events = saveEvents(id, rd.events);
  responseDeliverTx.codespace = rd.codespace;
  responseDeliverTx.save();
  return id;
}

function saveAnies(id: string, a: Array<cosmos.Any>): Array<string> {
  let anyIds = new Array<string>(a.length);
  for (let i = 0; i < a.length; i++) {
    anyIds[i] = saveAny(`${id}-${i}`, a[i]);
  }
  return anyIds;
}

function saveAny(id: string, a: cosmos.Any): string {
  const any = new Any(id);
  any.typeUrl = a.typeUrl;
  any.value = a.value;
  any.save();
  return id;
}

function saveTxBody(id: string, tb: cosmos.TxBody): string {
  const txBody = new TxBody(id);
  txBody.messages = saveAnies(id, tb.messages);
  txBody.memo = tb.memo;
  txBody.timeoutHeight = BigInt.fromString(tb.timeoutHeight.toString());
  txBody.extensionOptions = saveAnies(id, tb.extensionOptions);
  txBody.nonCriticalExtensionOptions = saveAnies(id, tb.nonCriticalExtensionOptions);
  txBody.save();
  return id;
}

function getSignMode(signMode: cosmos.SignMode): string {
  switch (signMode) {
    case cosmos.SignMode.SIGN_MODE_UNSPECIFIED:
      return "SIGN_MODE_UNSPECIFIED";
    case cosmos.SignMode.SIGN_MODE_DIRECT:
      return "SIGN_MODE_DIRECT";
    case cosmos.SignMode.SIGN_MODE_TEXTUAL:
      return "SIGN_MODE_TEXTUAL";
    case cosmos.SignMode.SIGN_MODE_LEGACY_AMINO_JSON:
      return "SIGN_MODE_LEGACY_AMINO_JSON";
    default:
      log.error("unknown SignMode: {}", [signMode.toString()]);
      return "unknown";
  }
}

function saveModeInfoSingle(id: string, mi: cosmos.ModeInfoSingle): string {
  const modeInfoSingle = new ModeInfoSingle(id);
  modeInfoSingle.mode = getSignMode(mi.mode);
  modeInfoSingle.save();
  return id;
}

function saveCompactBitArray(id: string, cba: cosmos.CompactBitArray): string {
  const compactBitArray = new CompactBitArray(id);
  compactBitArray.extraBitsStored = new BigInt(cba.extraBitsStored);
  compactBitArray.elems = cba.elems;
  compactBitArray.save();
  return id;
}

function saveModeInfoMulti(id: string, mi: cosmos.ModeInfoMulti): string {
  const modeInfoMulti = new ModeInfoMulti(id);
  modeInfoMulti.bitarray = saveCompactBitArray(id, mi.bitarray);
  modeInfoMulti.modeInfos = saveModeInfos(id, mi.modeInfos);
  modeInfoMulti.save();
  return id;
}

function saveModeInfos(id: string, modeInfos: Array<cosmos.ModeInfo>): Array<string> {
  let modeInfoIds = new Array<string>(modeInfos.length);
  for (let i = 0; i < modeInfos.length; i++) {
    modeInfoIds[i] = saveModeInfo(`${id}-${i}`, modeInfos[i]);
  }
  return modeInfoIds;
}

function saveModeInfo(id: string, mi: cosmos.ModeInfo): string {
  const modeInfo = new ModeInfo(id);
  modeInfo.single = saveModeInfoSingle(id, mi.single);
  modeInfo.multi = saveModeInfoMulti(id, mi.multi);
  modeInfo.save();
  return id;
}

function saveSignerInfos(id: string, signerInfos: Array<cosmos.SignerInfo>): Array<string> {
  let signerInfoIds = new Array<string>(signerInfos.length);
  for (let i = 0; i < signerInfos.length; i++) {
    signerInfoIds[i] = saveSignerInfo(`${id}-${i}`, signerInfos[i]);
  }
  return signerInfoIds;
}

function saveSignerInfo(id: string, si: cosmos.SignerInfo): string {
  const signerInfo = new SignerInfo(id);
  signerInfo.publicKey = saveAny(id, si.publicKey);
  signerInfo.modeInfo = saveModeInfo(id, si.modeInfo);
  signerInfo.sequence = BigInt.fromString(si.sequence.toString());
  signerInfo.save();
  return id;
}

function saveFee(id: string, f: cosmos.Fee): string {
  const fee = new Fee(id);
  fee.amount = saveCoins(id, f.amount);
  fee.gasLimit = BigInt.fromString(f.gasLimit.toString());
  fee.payer = f.payer;
  fee.granter = f.granter;
  fee.save();
  return id;
}

function saveTip(id: string, t: cosmos.Tip): string {
  const tip = new Tip(id);
  tip.amount = saveCoins(id, t.amount);
  tip.tipper = t.tipper;
  tip.save();
  return id;
}

function saveCoins(id: string, coins: Array<cosmos.Coin>): Array<string> {
  let coinIds = new Array<string>(coins.length);
  for (let i = 0; i < coins.length; i++) {
    coinIds[i] = saveCoin(`${id}-${i}`, coins[i]);
  }
  return coinIds;
}

function saveCoin(id: string, c: cosmos.Coin): string {
  const coin = new Coin(id);
  coin.denom = c.denom;
  coin.amount = c.amount;
  coin.save();
  return id;
}

function saveAuthInfo(id: string, ai: cosmos.AuthInfo): string {
  const authInfo = new AuthInfo(id);
  authInfo.signerInfos = saveSignerInfos(id, ai.signerInfos);
  authInfo.fee = saveFee(id, ai.fee);
  authInfo.tip = saveTip(id, ai.tip);
  authInfo.save();
  return id;
}

function saveTx(id: string, t: cosmos.Tx): string {
  const tx = new Tx(id);
  tx.body = saveTxBody(id, t.body);
  tx.authInfo = saveAuthInfo(id, t.authInfo);
  tx.signatures = t.signatures;
  tx.save();
  return id;
}

function saveTxResults(id: string, txReses: Array<cosmos.TxResult>): Array<string> {
  let txIds = new Array<string>(txReses.length);
  for (let i = 0; i < txReses.length; i++) {
    txIds[i] = saveTxResult(`${id}-${i}`, txReses[i]);
  }
  return txIds;
}

function saveTxResult(id: string, txRes: cosmos.TxResult): string {
  const txResult = new TxResult(id);
  txResult.height = BigInt.fromString(txRes.height.toString());
  txResult.index = BigInt.fromString(txRes.index.toString());
  txResult.tx = saveTx(id, txRes.tx);
  txResult.result = saveResponseDeliverTx(id, txRes.result);
  txResult.hash = txRes.hash;
  txResult.save();
  return id;
}

function saveResponseEndBlock(id: string, endBlock: cosmos.ResponseEndBlock): string {
  const responseEndBlock = new ResponseEndBlock(id);
  responseEndBlock.validatorUpdates = saveValidatorUpdates(id, endBlock.validatorUpdates);
  responseEndBlock.consensusParamUpdates = saveConsensusParams(id, endBlock.consensusParamUpdates);
  responseEndBlock.events = saveEvents(id, endBlock.events);
  responseEndBlock.save();
  return id;
}

function saveConsensusParams(id: string, cp: cosmos.ConsensusParams): string {
  const consensusParams = new ConsensusParams(id);
  consensusParams.block = saveBlockParams(id, cp.block);
  consensusParams.evidence = saveEvidenceParams(id, cp.evidence);
  consensusParams.validator = saveValidatorParams(id, cp.validator);
  consensusParams.version = saveVersionParams(id, cp.version);
  consensusParams.save();
  return id;
}

function saveBlockParams(id: string, bp: cosmos.BlockParams): string {
  const blockParams = new BlockParams(id);
  blockParams.maxBytes = BigInt.fromString(bp.maxBytes.toString());
  blockParams.maxGas = BigInt.fromString(bp.maxGas.toString());
  blockParams.save()
  return id;
}

function saveEvidenceParams(id: string, ep: cosmos.EvidenceParams): string {
  const evidenceParams = new EvidenceParams(id);
  evidenceParams.maxAgeNumBlocks = BigInt.fromString(ep.maxAgeNumBlocks.toString());
  evidenceParams.maxAgeDuration = saveDuration(id, ep.maxAgeDuration);
  evidenceParams.maxBytes = BigInt.fromString(ep.maxBytes.toString());
  evidenceParams.save()
  return id;
}

function saveValidatorParams(id: string, vp: cosmos.ValidatorParams): string {
  const validatorParams = new ValidatorParams(id);
  validatorParams.pubKeyTypes = vp.pubKeyTypes;
  validatorParams.save()
  return id;
}

function saveVersionParams(id: string, vp: cosmos.VersionParams): string {
  const versionParams = new VersionParams(id);
  versionParams.appVersion = BigInt.fromString(vp.appVersion.toString());
  versionParams.save()
  return id;
}

function saveDuration(id: string, d: cosmos.Duration): string {
  const duration = new Duration(id);
  duration.seconds = BigInt.fromString(d.seconds.toString());
  duration.nanos = d.nanos;
  duration.save();
  return id;
}

function saveResponseBeginBlock(id: string, beginBlock: cosmos.ResponseBeginBlock): string {
  const responseBeginBlock = new ResponseBeginBlock(id);
  responseBeginBlock.events = saveEvents(id, beginBlock.events);
  responseBeginBlock.save();
  return id;
}

function saveEvents(id: string, events: Array<cosmos.Event>): Array<string> {
  let eventIds = new Array<string>(events.length);
  for (let i = 0; i < events.length; i++) {
    eventIds[i] = saveEvent(`${id}-${i}`, events[i]);
  }
  return eventIds;
}

function saveEvent(id: string, e: cosmos.Event): string {
  const event = new Event(id);
  event.eventType = e.eventType;
  event.attributes = saveEventAttributes(id, e.attributes)
  event.save()
  return id;
}

function saveEventAttributes(id: string, eventAttributes: Array<cosmos.EventAttribute>): Array<string> {
  let eventAttributeIds = new Array<string>(eventAttributes.length);
  for (let i = 0; i < eventAttributes.length; i++) {
    eventAttributeIds[i] = saveEventAttribute(`${id}-${i}`, eventAttributes[i]);
  }
  return eventAttributeIds;
}

function saveEventAttribute(id: string, ea: cosmos.EventAttribute): string {
  const eventAttribute = new EventAttribute(id);
  eventAttribute.key = ea.key;
  eventAttribute.value = ea.value;
  eventAttribute.index = ea.index;
  eventAttribute.save()
  return id;
}

function saveValidatorUpdates(id: string, validators: Array<cosmos.ValidatorUpdate>): Array<string> {
  let validatorIDs = new Array<string>(validators.length);
  for (let i = 0; i < validators.length; i++) {
    const v = validators[i];
    const address = v.address.toHexString();

    validatorIDs[i] = saveValidatorUpdate(`${id}-${address}`, v);
  }
  return validatorIDs;
}

function saveValidatorUpdate(id: string, v: cosmos.ValidatorUpdate): string {
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
