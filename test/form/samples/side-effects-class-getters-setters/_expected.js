class RetainedByGetter {
	get a() { log(); }
}
RetainedByGetter.prototype.a;

class RetainedBySetter {
	set a(v) { log(); }
}
RetainedBySetter.prototype.a = 10;

class RetainedByStaticGetter {
	static get a() { log(); }
}
RetainedByStaticGetter.a;

class RetainedByStaticSetter {
	static set a(v) { log(); }
}
RetainedByStaticSetter.a = 10;

class RetainedSuper {
	static get a() { log(); }
}
class RetainedSub extends RetainedSuper {}
RetainedSub.a;
log();

class DeoptProto {
	a = true;
}
globalThis.unknown(DeoptProto.prototype);
if (!DeoptProto.prototype.a) log();

class DeoptComputed {
	static get a() {}
	static get [globalThis.unknown]() { log(); }
}
DeoptComputed.a;
