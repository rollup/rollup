import dep from './dep.js';

export default function log (x) {
  if (dep) {
    console.log(x);
  }
}