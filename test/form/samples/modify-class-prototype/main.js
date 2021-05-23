class Removed {}
Removed.prop = 42;
Removed.prototype.prop = 43;
Removed.prototype.prop2 = Removed.prototype.prop;

export class Retained {}
Retained.prop = 42;
Retained.prototype.prop = 43;
Retained.prototype.prop2 = Retained.prototype.prop;

class RemovedSuper {
	prop() {}
}
class RemovedWithSuper extends RemovedSuper {}
RemovedWithSuper.prototype.prop = 42;
RemovedWithSuper.prototype.prop2 = 43;

class RetainedSuper {
	set prop(v) {
		console.log('effect', v);
	}
}
class RetainedWithSuper extends RetainedSuper {}
RetainedWithSuper.prototype.prop = 42;
