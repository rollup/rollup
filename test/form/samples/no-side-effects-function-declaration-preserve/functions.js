export function fnPure(args) {
  return args
}

export function fnEffects(args) {
  console.log(args)
  return args
}

/*#__NO_SIDE_EFFECTS__*/
function fnA (args) {
  console.log(args)
  return args
}
export { fnA }

/*#__NO_SIDE_EFFECTS__*/
export function fnB (args) {
  console.log(args)
  return args
}

export const fnC = /*#__NO_SIDE_EFFECTS__*/ (args) => {
  console.log(args)
  return args
}


/*#__NO_SIDE_EFFECTS__*/
const fnD = (args) => {
  console.log(args)
  return args
}

export { fnD }

/*#__NO_SIDE_EFFECTS__*/
export const fnE = (args) => {
  console.log(args)
  return args
}

/**
 * This is a jsdoc comment, with no side effects annotation
 *
 * @param {any} args
 * @__NO_SIDE_EFFECTS__
 */
export const fnF = (args) => {
  console.log(args)
  return args
}

/*#__NO_SIDE_EFFECTS__*/
export default function fnDefault(args) {
  console.log(args)
  return args
}

export * from './sub-functions'

export const fnAlias = fnA

// This annonation get ignored
/** @__NO_SIDE_EFFECTS__ */
export let fnLet = (args) => {
  console.log(args)
  return args
}
