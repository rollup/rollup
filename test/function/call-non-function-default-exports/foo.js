function x () {
  global.answer = 'x';
}

function y () {
  global.answer = 'y';
}

export default Math.random() < 0.5 ? x : y;
