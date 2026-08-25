let x = 0;
let y = 0;

function checkXNE() {
  return x !== 0;
}

function checkXGT() {
  return x > 0;
}

function checkYNE() {
  return y !== 0;
}

function checkYGT() {
  return y > 0;
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

function ay() {
  if (Math.random() > 0.5) return by();
  if (Math.random() > 0.5) return by();
  return by();
}

function by() {
  if (Math.random() > 0.5) return cy();
  if (Math.random() > 0.5) return cy();
  return cy();
}

function cy() {
  if (Math.random() > 0.5) return dy();
  if (Math.random() > 0.5) return dy();
  return dy();
}

function dy() {
  if (Math.random() > 0.5) return checkYNE();
  return checkYGT();
}

if (ax()) console.log('KO');
else console.log('OK');

x = 1;

if (ax()) console.log('OK');
else console.log('KO');

if (ay()) console.log('KO');
else console.log('OK');
