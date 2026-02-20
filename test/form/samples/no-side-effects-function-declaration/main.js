import fnDefault, {
	fnA,
	fnAlias,
	fnB,
	fnC1,
	fnC2,
	fnD1,
	fnD2,
	fnE1,
	fnE2,
	fnEffects,
	fnF1,
	fnF2,
	fnFromSub,
	fnG,
	fnH1,
	fnH2,
	fnI1,
	fnI2,
	fnJ,
	fnK,
	fnPure
} from './functions';

const pure = fnPure(1);
const effects = fnEffects(2);

const a = fnA(1);
const b = fnB(2);
const c = fnC1(3);
const d = fnC2(3);
const e = fnD1(4);
const f = fnD2(4);
const g = fnE1(5);
const h = fnE2(5);
const i = fnF1(6);
const j = fnF2(6);
const k = fnG(7);
const l = fnH1(7);
const m = fnH2(7);
const n = fnI1(8);
const o = fnI2(8);
const p = fnJ(9);
const q = fnK(10);

const defaults = fnDefault(3);
const alias = fnAlias(6);
const fromSub = fnFromSub(7);

const _ = /*#__PURE__*/ fnEffects(1);
