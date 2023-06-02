/*#__PURE__*/
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

/*#__PURE__*/
function fnA (args) {
  console.log(args);
  return args
}

/*#__PURE__*/
function fnB (args) {
  console.log(args);
  return args
}

const fnC = /*#__PURE__*/ (args) => {
  console.log(args);
  return args
};


/*#__PURE__*/ 
const fnD = (args) => {
  console.log(args);
  return args
};

/*#__PURE__*/ 
const fnE = (args) => {
  console.log(args);
  return args
};

const fnAlias = fnA;

export { fnA, fnAlias, fnB, fnC, fnD, fnE, fnEffects, fnFromSub, fnPure };
