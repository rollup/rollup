import react from 'react';

const div$1 = 'wrong div 1';
const span$1 = 'wrong span 1';
console.log(div$1, span$1);

console.log(/*#__PURE__*/react.createElement("div", null));
console.log(/*#__PURE__*/react.createElement("div", null, /*#__PURE__*/react.createElement("span", null)));

const div = 'wrong div 2';
const span = 'wrong span 2';
console.log(div, span);
