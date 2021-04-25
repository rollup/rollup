class Removed {
	get a() { log(); }
	set a(v) { log(); }
	static get a() { log(); }
	static set a(v) { log(); }
}

class RemovedNoEffect {
	get a() {}
	set a(v) {}
	static get a() {}
	static set a(v) {}
}
RemovedNoEffect.prototype.a;
RemovedNoEffect.prototype.a = 1;
RemovedNoEffect.a;
RemovedNoEffect.a = 1;

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

class RemovedSetters {
	set a(v) { log(); }
	static set a(v) { log(); }
}
RemovedSetters.prototype.a;
RemovedSetters.a;

class RemovedWrongProp {
	get a() { log(); }
	static get a() { log(); }
}
RemovedWrongProp.prototype.b
RemovedWrongProp.b

class RetainedSuper {
	static get a() { log(); }
}
class RetainedSub extends RetainedSuper {}
RetainedSub.a;

class RemovedSub extends RetainedSuper {}
RemovedSub.b;

// class fields are not part of the prototype
class RemovedProtoValue {
	a = true;
}
if (!RemovedProtoValue.prototype.a) log();

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
