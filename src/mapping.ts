import { BigInt, log, cosmos } from "@graphprotocol/graph-ts";
import { cosmos as cosmos_messages } from "graph-cosmos-ts";
import {
  Block,
  Header,
  ExtensionOption,
  Message,
  PublicKeyAny,
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
  block.header = saveHeader(`${id}-header`, b.header);
  block.evidence = saveEvidenceList(`${id}-evidence`, b.evidence);
  block.lastCommit = saveCommit(`${id}-lastCommit`, b.lastCommit);
  block.resultBeginBlock = saveResponseBeginBlock(
    `${id}-resultBeginBlock`,
    b.resultBeginBlock
  );
  block.resultEndBlock = saveResponseEndBlock(
    `${id}-resultEndBlock`,
    b.resultEndBlock
  );
  block.transactions = saveTransactions(`${id}-transactions`, b.transactions);
  block.validatorUpdates = saveValidators(
    `${id}-validatorUpdate`,
    b.validatorUpdates
  );
  block.save();
}

function saveTransactions(
  id: string,
  txs: Array<cosmos.TxResult>
): Array<string> {
  const txLngth = txs.length;
  let txIDs = new Array<string>(txLngth);
  for (let index = 0; index < txLngth; index++) {
    txIDs[index] = saveTxResult(`${id}-${index.toString()}`, txs[index]);
  }
  return txIDs;
}

function saveBlockID(bID: cosmos.BlockID): string {
  const id = bID.hash.toHexString();
  let blockID = BlockID.load(id);
  if (blockID !== null) {
    log.debug("BlockID with id: {} already exists", [id]);
    return id;
  }

  blockID = new BlockID(id);
  blockID.hash = bID.hash;
  blockID.partSetHeader = savePartSetHeader(
    `${id}-partSetHeader`,
    bID.partSetHeader
  );
  blockID.save();
  return id;
}

function savePartSetHeader(id: string, psh: cosmos.PartSetHeader): string {
  const partSetHeader = new PartSetHeader(id);
  partSetHeader.total = BigInt.fromU64(psh.total);
  partSetHeader.hash = psh.hash;
  partSetHeader.save();
  return id;
}

function saveHeader(id: string, h: cosmos.Header): string {
  const header = new Header(id);
  header.version = saveVersion(`${id}-version`, h.version);
  header.chainId = h.chainId;
  header.height = BigInt.fromU64(h.height);
  header.time = saveTimestamp(`${id}-time`, h.time);
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
  header.hash = h.hash;
  header.save();
  return id;
}

function saveVersion(id: string, v: cosmos.Consensus): string {
  const version = new Consensus(id);
  version.block = BigInt.fromU64(v.block);
  version.app = BigInt.fromU64(v.app);
  version.save();
  return id;
}

function saveTimestamp(id: string, ts: cosmos.Timestamp): string {
  const timestamp = new Timestamp(id);
  timestamp.seconds = BigInt.fromI64(ts.seconds);
  timestamp.nanos = ts.nanos;
  timestamp.save();
  return id;
}

function saveEvidenceList(id: string, el: cosmos.EvidenceList): string {
  if (el.evidence.length == 0) {
    return "";
  }

  const evidenceList = new EvidenceList(id);
  evidenceList.evidence = saveEvidences(`${id}-evidence`, el.evidence);
  evidenceList.save();
  return id;
}

function saveEvidences(id: string, evs: Array<cosmos.Evidence>): Array<string> {
  const length = evs.length;
  let evidenceIDs = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    evidenceIDs[i] = saveEvidence(`${id}-${i}`, evs[i]);
  }
  return evidenceIDs;
}

function saveEvidence(id: string, e: cosmos.Evidence): string {
  const evidence = new Evidence(id);
  if (e.duplicateVoteEvidence !== null) {
    evidence.duplicateVoteEvidence = saveDuplicateVoteEvidence(
      `${id}-duplicateVoteEvidence`,
      e.duplicateVoteEvidence
    );
  } else if (e.lightClientAttackEvidence !== null) {
    evidence.lightClientAttackEvidence = saveLightClientAttackEvidence(
      `${id}-lightClientAttackEvidence`,
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
  duplicateVoteEvidence.totalVotingPower = BigInt.fromI64(e.totalVotingPower);
  duplicateVoteEvidence.validatorPower = BigInt.fromI64(e.validatorPower);
  duplicateVoteEvidence.timestamp = saveTimestamp(
    `${id}-timestamp`,
    e.timestamp
  );
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
  eventVote.height = BigInt.fromU64(ev.height);
  eventVote.round = ev.round;
  eventVote.blockId = ev.blockId.hash.toHexString();
  eventVote.timestamp = saveTimestamp(`${id}-timestamp`, ev.timestamp);
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
    `${id}-conflictingBlock`,
    e.conflictingBlock
  );
  lightClientAttackEvidence.commonHeight = BigInt.fromI64(e.commonHeight);
  lightClientAttackEvidence.byzantineValidators = saveValidators(
    `${id}-byzantineValidators`,
    e.byzantineValidators
  );
  lightClientAttackEvidence.totalVotingPower = BigInt.fromI64(
    e.totalVotingPower
  );
  lightClientAttackEvidence.timestamp = saveTimestamp(
    `${id}-timestamp`,
    e.timestamp
  );
  lightClientAttackEvidence.save();
  return id;
}

function saveLightBlock(id: string, lb: cosmos.LightBlock): string {
  const lightBlock = new LightBlock(id);
  lightBlock.signedHeader = saveSignedHeader(
    `${id}-signedHeader`,
    lb.signedHeader
  );
  lightBlock.validatorSet = saveValidatorSet(
    `${id}-validatorsSet`,
    lb.validatorSet
  );
  lightBlock.save();
  return id;
}

function saveSignedHeader(id: string, sh: cosmos.SignedHeader): string {
  const signedHeader = new SignedHeader(id);
  signedHeader.header = saveHeader(`${id}-header`, sh.header);
  signedHeader.commit = saveCommit(`${id}-commit`, sh.commit);
  signedHeader.save();
  return id;
}

function saveValidatorSet(id: string, sh: cosmos.ValidatorSet): string {
  const validatorSet = new ValidatorSet(id);
  validatorSet.validators = saveValidators(`${id}-validators`, sh.validators);
  validatorSet.proposer = saveValidator(`${id}-proposer`, sh.proposer);
  validatorSet.totalVotingPower = BigInt.fromI64(sh.totalVotingPower);
  validatorSet.save();
  return id;
}

function saveValidators(
  id: string,
  validators: Array<cosmos.Validator>
): Array<string> {
  const length = validators.length;
  let validatorIDs = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    validatorIDs[i] = saveValidator(`${id}-${i}`, validators[i]);
  }
  return validatorIDs;
}

function saveValidator(id: string, v: cosmos.Validator): string {
  const validator = new Validator(id);
  validator.address = v.address;
  validator.votingPower = BigInt.fromI64(v.votingPower);
  validator.proposerPriority = BigInt.fromI64(v.proposerPriority);
  validator.pubKey = savePublicKey(v.pubKey);
  validator.save();
  return id;
}

function saveCommit(id: string, c: cosmos.Commit): string {
  const commit = new Commit(id);
  commit.height = BigInt.fromI64(c.height);
  commit.round = c.round;
  commit.blockId = saveBlockID(c.blockId);
  commit.signatures = saveCommitSigs(`${id}-signatures`, c.signatures);
  commit.save();
  return id;
}

function saveCommitSigs(
  id: string,
  cs: Array<cosmos.CommitSig>
): Array<string> {
  const length = cs.length;
  let commitSigIDs = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    commitSigIDs[i] = saveCommitSig(`${id}-${i}`, cs[i]);
  }
  return commitSigIDs;
}

function saveCommitSig(id: string, cs: cosmos.CommitSig): string {
  const commitSig = new CommitSig(id);
  commitSig.blockIdFlag = getBlockIDFlag(cs.blockIdFlag);
  commitSig.validatorAddress = cs.validatorAddress;
  commitSig.timestamp = saveTimestamp(`${id}-timestamp`, cs.timestamp);
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
  rd: cosmos.ResponseDeliverTx
): string {
  const responseDeliverTx = new ResponseDeliverTx(id);
  responseDeliverTx.code = BigInt.fromU32(rd.code);
  responseDeliverTx.data = rd.data;
  responseDeliverTx.log = rd.log;
  responseDeliverTx.info = rd.info;
  responseDeliverTx.gasWanted = BigInt.fromI64(rd.gasWanted);
  responseDeliverTx.gasUsed = BigInt.fromI64(rd.gasUsed);
  responseDeliverTx.events = saveEvents(`${id}-events`, rd.events);
  responseDeliverTx.codespace = rd.codespace;
  responseDeliverTx.save();
  return id;
}

function saveTxBody(id: string, tb: cosmos.TxBody): string {
  const txBody = new TxBody(id);
  txBody.messages = saveMessages(`${id}-messages`, tb.messages);
  txBody.memo = tb.memo;
  txBody.timeoutHeight = BigInt.fromString(tb.timeoutHeight.toString());
  txBody.extensionOptions = saveExtensionOptions(
    `${id}-extensionOptions`,
    tb.extensionOptions
  );
  txBody.nonCriticalExtensionOptions = saveExtensionOptions(
    `${id}-nonCriticalExtensionOptions`,
    tb.nonCriticalExtensionOptions
  );
  txBody.save();
  txBody.save();
  return id;
}

function saveMessages(id: string, anies: Array<cosmos.Any>): Array<string> {
  const length = anies.length;
  const ids = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    ids[i] = saveMessage(`${id}-${i}`, i, anies[i]);
  }
  return ids;
}

function saveMessage(id: string, index: i32, any: cosmos.Any): string {
  const msg = new Message(id);
  msg.index = index;
  msg.typeUrl = any.typeUrl;
  msg.value = any.value;
  msg.save();
  return id;
}

function saveExtensionOptions(
  id: string,
  anies: Array<cosmos.Any>
): Array<string> {
  const length = anies.length;
  const ids = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    ids[i] = saveExtensionOption(`${id}-${i}`, i, anies[i]);
  }

  return ids;
}

function saveExtensionOption(id: string, index: i32, any: cosmos.Any): string {
  const msg = new ExtensionOption(id);
  msg.index = index;
  msg.typeUrl = any.typeUrl;
  msg.value = any.value;
  msg.save();
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
  compactBitArray.extraBitsStored = BigInt.fromI32(cba.extraBitsStored);
  compactBitArray.elems = cba.elems;
  compactBitArray.save();
  return id;
}

function saveModeInfoMulti(id: string, mi: cosmos.ModeInfoMulti): string {
  const modeInfoMulti = new ModeInfoMulti(id);
  modeInfoMulti.bitarray = saveCompactBitArray(`${id}-bitarray`, mi.bitarray);
  modeInfoMulti.modeInfos = saveModeInfos(`${id}-modeInfos`, mi.modeInfos);
  modeInfoMulti.save();
  return id;
}

function saveModeInfos(
  id: string,
  modeInfos: Array<cosmos.ModeInfo>
): Array<string> {
  const length = modeInfos.length;
  let modeInfoIds = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    modeInfoIds[i] = saveModeInfo(`${id}-${i}`, modeInfos[i]);
  }
  return modeInfoIds;
}

function saveModeInfo(id: string, mi: cosmos.ModeInfo): string {
  const modeInfo = new ModeInfo(id);
  modeInfo.single = saveModeInfoSingle(`${id}-modeInfoSingle`, mi.single);
  modeInfo.multi = saveModeInfoMulti(`${id}-modeInfoMulti`, mi.multi);
  modeInfo.save();
  return id;
}

function saveSignerInfos(
  id: string,
  signerInfos: Array<cosmos.SignerInfo>
): Array<string> {
  const length = signerInfos.length;
  const ids = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    ids[i] = saveSignerInfo(`${id}-${i}`, signerInfos[i]);
  }
  return ids;
}

function saveSignerInfo(id: string, si: cosmos.SignerInfo): string {
  const signerInfo = new SignerInfo(id);
  signerInfo.publicKey = savePublicKeyAny(`${id}-publicKeyAny`, si.publicKey);
  signerInfo.modeInfo = saveModeInfo(`${id}-modeInfo`, si.modeInfo);
  signerInfo.sequence = BigInt.fromU64(si.sequence);
  signerInfo.save();
  return id;
}

function saveFee(id: string, f: cosmos.Fee): string {
  const fee = new Fee(id);
  fee.amount = saveCoins(`${id}-coins`, f.amount);
  fee.gasLimit = BigInt.fromU64(f.gasLimit);
  fee.payer = f.payer;
  fee.granter = f.granter;
  fee.save();
  return id;
}

function saveTip(id: string, t: cosmos.Tip): string {
  const tip = new Tip(id);
  tip.amount = saveCoins(`${id}-coins`, t.amount);
  tip.tipper = t.tipper;
  tip.save();
  return id;
}

function saveCoins(id: string, coins: Array<cosmos.Coin>): Array<string> {
  const length = coins.length;
  const ids = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    ids[i] = saveCoin(`${id}-${i}`, coins[i]);
  }
  return ids;
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
  authInfo.signerInfos = saveSignerInfos(`${id}-signerInfos`, ai.signerInfos);
  authInfo.fee = saveFee(`${id}-fee`, ai.fee);
  authInfo.tip = saveTip(`${id}-tip`, ai.tip);
  authInfo.save();
  return id;
}

function saveTx(id: string, t: cosmos.Tx): string {
  const tx = new Tx(id);
  tx.body = saveTxBody(`${id}-body`, t.body);
  tx.authInfo = saveAuthInfo(`${id}-authInfo`, t.authInfo);
  tx.signatures = t.signatures;
  tx.save();
  return id;
}

function saveTxResult(id: string, txRes: cosmos.TxResult): string {
  const txResult = new TxResult(id);
  txResult.height = BigInt.fromU64(txRes.height);
  txResult.index = BigInt.fromU32(txRes.index);
  txResult.tx = saveTx(`${id}-tx`, txRes.tx);
  txResult.result = saveResponseDeliverTx(`${id}-result`, txRes.result);
  txResult.hash = txRes.hash;
  txResult.save();
  return id;
}

function saveResponseEndBlock(
  id: string,
  endBlock: cosmos.ResponseEndBlock
): string {
  const responseEndBlock = new ResponseEndBlock(id);
  responseEndBlock.validatorUpdates = saveValidatorUpdates(
    `${id}-validatorUpdates`,
    endBlock.validatorUpdates
  );
  responseEndBlock.consensusParamUpdates = saveConsensusParams(
    `${id}-consensusParamUpdates`,
    endBlock.consensusParamUpdates
  );
  responseEndBlock.events = saveEvents(`${id}-events`, endBlock.events);
  responseEndBlock.save();
  return id;
}

function saveConsensusParams(id: string, cp: cosmos.ConsensusParams): string {
  const consensusParams = new ConsensusParams(id);
  consensusParams.block = saveBlockParams(`${id}-block`, cp.block);
  consensusParams.evidence = saveEvidenceParams(`${id}-evidence`, cp.evidence);
  consensusParams.validator = saveValidatorParams(
    `${id}-validator`,
    cp.validator
  );
  consensusParams.version = saveVersionParams(`${id}-version`, cp.version);
  consensusParams.save();
  return id;
}

function saveBlockParams(id: string, bp: cosmos.BlockParams): string {
  const blockParams = new BlockParams(id);
  blockParams.maxBytes = BigInt.fromI64(bp.maxBytes);
  blockParams.maxGas = BigInt.fromI64(bp.maxGas);
  blockParams.save();
  return id;
}

function saveEvidenceParams(id: string, ep: cosmos.EvidenceParams): string {
  const evidenceParams = new EvidenceParams(id);
  evidenceParams.maxAgeNumBlocks = BigInt.fromI64(ep.maxAgeNumBlocks);
  evidenceParams.maxAgeDuration = saveDuration(
    `${id}-maxAgeDuration`,
    ep.maxAgeDuration
  );
  evidenceParams.maxBytes = BigInt.fromI64(ep.maxBytes);
  evidenceParams.save();
  return id;
}

function saveValidatorParams(id: string, vp: cosmos.ValidatorParams): string {
  const validatorParams = new ValidatorParams(id);
  validatorParams.pubKeyTypes = vp.pubKeyTypes;
  validatorParams.save();
  return id;
}

function saveVersionParams(id: string, vp: cosmos.VersionParams): string {
  const versionParams = new VersionParams(id);
  versionParams.appVersion = BigInt.fromU64(vp.appVersion);
  versionParams.save();
  return id;
}

function saveDuration(id: string, d: cosmos.Duration): string {
  const duration = new Duration(id);
  duration.seconds = BigInt.fromI64(d.seconds);
  duration.nanos = d.nanos;
  duration.save();
  return id;
}

function saveResponseBeginBlock(
  id: string,
  beginBlock: cosmos.ResponseBeginBlock
): string {
  const responseBeginBlock = new ResponseBeginBlock(id);
  responseBeginBlock.events = saveEvents(`${id}-events`, beginBlock.events);
  responseBeginBlock.save();
  return id;
}

function saveEvents(id: string, events: Array<cosmos.Event>): Array<string> {
  const length = events.length;
  let eventIds = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    eventIds[i] = saveEvent(`${id}-${i}`, events[i]);
  }
  return eventIds;
}

function saveEvent(id: string, e: cosmos.Event): string {
  const event = new Event(id);
  event.eventType = e.eventType;
  event.attributes = saveEventAttributes(`${id}-attributes`, e.attributes);
  event.save();
  return id;
}

function saveEventAttributes(
  id: string,
  eventAttributes: Array<cosmos.EventAttribute>
): Array<string> {
  const length = eventAttributes.length;
  let eventAttributeIds = new Array<string>(length);
  for (let i = 0; i < length; i++) {
    eventAttributeIds[i] = saveEventAttribute(`${id}-${i}`, eventAttributes[i]);
  }
  return eventAttributeIds;
}

function saveEventAttribute(id: string, ea: cosmos.EventAttribute): string {
  const eventAttribute = new EventAttribute(id);
  eventAttribute.key = ea.key;
  eventAttribute.value = ea.value;
  eventAttribute.index = ea.index;
  eventAttribute.save();
  return id;
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

function saveValidatorUpdate(id: string, v: cosmos.ValidatorUpdate): string {
  const validatorUpdate = new ValidatorUpdate(id);
  validatorUpdate.address = v.address;
  validatorUpdate.pubKey = savePublicKey(v.pubKey);
  validatorUpdate.power = BigInt.fromI64(v.power);
  validatorUpdate.save();
  return id;
}

function savePublicKey(publicKey: cosmos.PublicKey): string {
  const id = publicKey.ed25519
    ? publicKey.ed25519.toString()
    : publicKey.secp256k1.toString();
  let pk = PublicKey.load(id);
  if (pk !== null) {
    log.debug("Validator with public key: {} already exists", [id]);
    return id;
  }

  pk = new PublicKey(id);
  pk.ed25519 = publicKey.ed25519;
  pk.secp256k1 = publicKey.secp256k1;
  pk.save();
  return id;
}

function savePublicKeyAny(id: string, any: cosmos.Any): string {
  const publicKey = new PublicKeyAny(id);
  publicKey.typeUrl = any.typeUrl;
  publicKey.value = any.value;
  publicKey.save();
  return id;
}
