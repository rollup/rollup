class Retained {}
Retained.prop = 42;
Retained.prototype.prop = 43;
Retained.prototype.prop2 = Retained.prototype.prop;

class RetainedSuper {
	set prop(v) {
		console.log('effect', v);
	}
}
class RetainedWithSuper extends RetainedSuper {}
RetainedWithSuper.prototype.prop = 42;

export { Retained };
