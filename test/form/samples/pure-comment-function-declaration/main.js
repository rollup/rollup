import { fnPure, fnEffects, fnA, fnB, fnC, fnD } from './functions'

const pure = fnPure(1)
const effects = fnEffects(2)

const a = fnA(1)
const b = fnB(2)
const c = fnC(3)
const d = fnD(4)
const e = fnE(5)

const _ = /*#__PURE__*/ fnEffects(1)
