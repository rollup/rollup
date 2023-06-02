export function fnPure(args) {
  return args
}

export function fnEffects(args) {
  console.log(args)
  return args
}

/*#__PURE__*/
function fnA (args) {
  console.log(args)
  return args
}
export { fnA }

/*#__PURE__*/
export function fnB (args) {
  console.log(args)
  return args
}

export const fnC = /*#__PURE__*/ (args) => {
  console.log(args)
  return args
}


/*#__PURE__*/ 
const fnD = (args) => {
  console.log(args)
  return args
}

export { fnD }

/*#__PURE__*/ 
export const fnE = (args) => {
  console.log(args)
  return args
}

/**
 * This is a jsdoc comment, with pure annotation
 * 
 * @param {any} args
 * @__PURE__
 */ 
export const fnF = (args) => {
  console.log(args)
  return args
}

/*#__PURE__*/ 
export default function fnDefault(args) {
  console.log(args)
  return args
}

export * from './sub-functions'

export const fnAlias = fnA
