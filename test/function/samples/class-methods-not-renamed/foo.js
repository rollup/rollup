import { bar } from 'path'; // path, so the test doesn't fail for unrelated reasons...

export default class Foo {
	bar () {
		if ( Math.random() < 0 ) return bar();
		return true;
	}
}
