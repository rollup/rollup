function a() {
  console.log('a');
  if (Math.random() > 0.5) return b(1)
  if (Math.random() > 0.5) return b(2)
  return b(3)
}

function b(x) {
  console.log('b', x);
  if (Math.random() > 0.5) return c(1)
  if (Math.random() > 0.5) return c(2)
  return c(3)
}

function c(x) {
  console.log('c', x);
  if (Math.random() > 0.5) return d(1)
  if (Math.random() > 0.5) return d(2)
  return d(3)
}

function d(x) {
  console.log('d', x);
  if (Math.random() > 0.5) return e(1)
  if (Math.random() > 0.5) return e(2)
  return e(3)
}

function e(x) {
  console.log('e', x);
  if (Math.random() > 0.5) return f(1)
  if (Math.random() > 0.5) return f(2)
  return f(3)
}

function f(x) {
  console.log('f', x);
  if (Math.random() > 0.5) return g(1)
  if (Math.random() > 0.5) return g(2)
  return g(3)
}

function g(x) {
  console.log('g', x);
  if (Math.random() > 0.5) return h(1)
  if (Math.random() > 0.5) return h(2)
  return h(3)
}

function h(x) {
  console.log('h', x);
  if (Math.random() > 0.5) return i(1)
  if (Math.random() > 0.5) return i(2)
  return i(3)
}

function i(x) {
  console.log('i', x);
  if (Math.random() > 0.5) return j(1)
  if (Math.random() > 0.5) return j(2)
  return j(3)
}

function j(x) {
  console.log('j', x);
  if (Math.random() > 0.5) return k(1)
  if (Math.random() > 0.5) return k(2)
  return k(3)
}

function k(x) {
  console.log('k', x);
  if (Math.random() > 0.5) return l(1)
  if (Math.random() > 0.5) return l(2)
  return l(3)
}

function l(x) {
  console.log('l', x);
  if (Math.random() > 0.5) return m(1)
  if (Math.random() > 0.5) return m(2)
  return m(3)
}

function m(x) {
  console.log('m', x);
  if (Math.random() > 0.5) return n(1)
  if (Math.random() > 0.5) return n(2)
  return n(3)
}

function n(x) {
  console.log('n', x);
  if (Math.random() > 0.5) return o(1)
  if (Math.random() > 0.5) return o(2)
  return o(3)
}

function o(x) {
  console.log('o', x);
  if (Math.random() > 0.5) return p(1)
  if (Math.random() > 0.5) return p(2)
  return p(3)
}

function p(x) {
  console.log('p', x);
  if (Math.random() > 0.5) return q(1)
  if (Math.random() > 0.5) return q(2)
  return q(3)
}

function q(x) {
  console.log('q', x);
  if (Math.random() > 0.5) return r(1)
  if (Math.random() > 0.5) return r(2)
  return r(3)
}

function r(x) {
  console.log('r', x);
  if (Math.random() > 0.5) return s(1)
  if (Math.random() > 0.5) return s(2)
  return s(3)
}

function s(x) {
  console.log('s', x);
  return true;
}

if (a()) console.log('OK');
else console.log('KO');
