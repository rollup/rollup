import three from './one/three';
import Two from './one/two';

export default function One () {
	return 1;
}

One.three = three;

/*** one.js */
One.two = Two;