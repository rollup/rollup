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



