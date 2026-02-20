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

export const fnC1 = /*#__NO_SIDE_EFFECTS__*/ (args) => {
  console.log(args)
  return args
}

export const fnC2 = /*#__NO_SIDE_EFFECTS__*/ function (args) {
  console.log(args);
  return args;
}

/*#__NO_SIDE_EFFECTS__*/
const fnD1 = (args) => {
  console.log(args)
  return args
}

/*#__NO_SIDE_EFFECTS__*/
const fnD2 = function (args) {
  console.log(args);
  return args;
}

export { fnD1, fnD2 }

/*#__NO_SIDE_EFFECTS__*/
export const fnE1 = (args) => {
  console.log(args)
  return args
}

/*#__NO_SIDE_EFFECTS__*/
export const fnE2 = function (args) {
  console.log(args);
  return args;
}

/**
 * This is a jsdoc comment, with pure annotation
 *
 * @param {any} args
 * @__NO_SIDE_EFFECTS__
 */
export const fnF1 = (args) => {
  console.log(args)
  return args
}

/**
 * This is a jsdoc comment, with pure annotation
 *
 * @param {any} args
 * @__NO_SIDE_EFFECTS__
 */
export const fnF2 = function (args) {
  console.log(args);
  return args;
}

// #__NO_SIDE_EFFECTS__
export async function fnG(args) {
  console.log(args)
  return args
}

/**
 * #__NO_SIDE_EFFECTS__
 */
export const fnH1 = async (args) => {
  console.log(args)
  return args
}

/**
 * #__NO_SIDE_EFFECTS__
 */
export const fnH2 = async function (args) {
  console.log(args);
  return args;
}

export const fnI1 = /*#__NO_SIDE_EFFECTS__*/ async (args) => {
  console.log(args)
  return args
}

export const fnI2 = /*#__NO_SIDE_EFFECTS__*/ async function (args) {
  console.log(args);
  return args;
}

/**
 * #__NO_SIDE_EFFECTS__
 */
export function * fnJ(args) {
  console.log(args)
  return args
}

/**
 * #__NO_SIDE_EFFECTS__
 */
export async function * fnK(args) {
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
