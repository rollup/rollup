let x = 0;

function checkXNE() {
  return x !== 0;
}

function checkXGT() {
  return x > 0;
}

function ax() {
  if (Math.random() > 0.5) return bx();
  if (Math.random() > 0.5) return bx();
  return bx();
}

function bx() {
  if (Math.random() > 0.5) return cx();
  if (Math.random() > 0.5) return cx();
  return cx();
}

function cx() {
  if (Math.random() > 0.5) return dx();
  if (Math.random() > 0.5) return dx();
  return dx();
}

function dx() {
  if (Math.random() > 0.5) return checkXNE();
  return checkXGT();
}

if (ax()) console.log('KO');
else console.log('OK');

x = 1;

if (ax()) console.log('OK');
else console.log('KO');

console.log('OK');
