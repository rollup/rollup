class SuperRemovedAssign {
	set prop(v) {}
}
class RemovedAssign extends SuperRemovedAssign {}
RemovedAssign.prototype.doesNotExist = 1;
RemovedAssign.prototype.prop = 1;

class SuperUsedAssign {
	method() {}
}
class UsedAssign extends SuperUsedAssign {}
UsedAssign.prototype.doesNotExist = 1;
UsedAssign.prototype.method.doesNotExist = 1;
console.log(UsedAssign);

class SuperAssign1 {}
class Assign1 extends SuperAssign1 {}
Assign1.prototype.doesNotExist.throws = 1;

class SuperAssign2 {
	prop = {};
}
class Assign2 extends SuperAssign2 {}
Assign2.prototype.prop.throws = 1;

class SuperAssign3 {
	method() {}
}
class Assign3 extends SuperAssign3 {}
Assign3.prototype.method.doesNotExist.throws = 1;

class SuperAssign4 {
	set prop(v) {
		console.log('effect', v);
	}
}
class Assign4 extends SuperAssign4 {}
Assign4.prototype.prop = 1;
