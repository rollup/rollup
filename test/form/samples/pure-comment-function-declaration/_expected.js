function fnEffects(args) {
  console.log(args);
  return args
}

const fnC = /*#__PURE__*/ (args) => {
  console.log(args);
  return args
};


 
const fnD = (args) => {
  console.log(args);
  return args
};

fnEffects(2);
fnC(3);
fnD(4);
fnE(5);
