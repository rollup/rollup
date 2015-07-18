import { bar } from 'path'; // path, so the test doesn't fail for unrelated reasons...

export default class Foo {
	bar () {
		if ( false ) return bar();
		return true;
	}
}
