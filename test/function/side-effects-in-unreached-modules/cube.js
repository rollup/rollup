import square2 from './square2';

function cubic(x) {
  return cubic.square(x) * x;
}
export var cube = cubic;
cube.square = square2;
