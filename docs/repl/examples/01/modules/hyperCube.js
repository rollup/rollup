import cube from './cube.js';

// This is only imported by one entry module and
// shares a chunk with that module
export default function hyperCube(x) {
	return cube(x) * x;
}
