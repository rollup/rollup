import * as util from './util';

util.foo.x; // removed
util.foo.nullVal; // removed
util.foo.nullVal?.x; // removed
util.foo.nullVal?.x.y; // removed
util.foo.nullVal?.(); // removed
util.foo.nullVal?.().x(); // removed

util.foo?.x.x; // retained

util.x; // removed
util.x?.x; // removed
util.x?.x.y; // removed
util.x?.(); // removed
util.x?.().x(); // removed

util?.x.x; // retained

if (
	util.foo.nullVal ||
	util.foo.nullVal?.x ||
	util.foo.nullVal?.x.y ||
	util.foo.nullVal?.() ||
	util.foo.nullVal?.().x()
) {
	console.log('removed');
}

if (util.x || util.x?.x || util.x?.x.y || util.x?.() || util.x?.().x()) {
	console.log('removed');
}
