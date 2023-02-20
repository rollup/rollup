import square from './square.js';

// Everything used by both entry modules will become
// a separate chunk that is imported by both entry
// chunks to avoid code duplication
export default function cube(x) {
	return square(x) * x;
}
