class SuperAccess {
	prop = {};
	method() {}
}
class Access extends SuperAccess {}
Access.prototype.doesNoExist.throws;
Access.prototype.prop.throws;
