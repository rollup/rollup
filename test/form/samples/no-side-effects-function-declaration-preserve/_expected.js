/*#__NO_SIDE_EFFECTS__*/
function fnFromSub (args) {
  console.log(args);
  return args
}

function fnPure(args) {
  return args
}

function fnEffects(args) {
  console.log(args);
  return args
}

/*#__NO_SIDE_EFFECTS__*/
function fnA (args) {
  console.log(args);
  return args
}

/*#__NO_SIDE_EFFECTS__*/
function fnB (args) {
  console.log(args);
  return args
}

const fnC = /*#__NO_SIDE_EFFECTS__*/ (args) => {
  console.log(args);
  return args
};


/*#__NO_SIDE_EFFECTS__*/
const fnD = (args) => {
  console.log(args);
  return args
};

/*#__NO_SIDE_EFFECTS__*/
const fnE = (args) => {
  console.log(args);
  return args
};

/**
 * This is a jsdoc comment, with no side effects annotation
 *
 * @param {any} args
 * @__NO_SIDE_EFFECTS__
 */
const fnF = (args) => {
  console.log(args);
  return args
};

const fnAlias = fnA;

// This annonation get ignored

let fnLet = (args) => {
  console.log(args);
  return args
};

export { fnA, fnAlias, fnB, fnC, fnD, fnE, fnEffects, fnF, fnFromSub, fnLet, fnPure };
