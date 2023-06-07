import fnDefault, { fnPure, fnEffects, fnA, fnB, fnC, fnD, fnE, fnF, fnAlias, fnFromSub } from './functions'

const pure = fnPure(1)
const effects = fnEffects(2)

const a = fnA(1)
const b = fnB(2)
const c = fnC(3)
const d = fnD(4)
const e = fnE(5)
const f = fnF(6)

const defaults = fnDefault(3)
const alias = fnAlias(6)
const fromSub = fnFromSub(7)

const _ = /*#__PURE__*/ fnEffects(1)
