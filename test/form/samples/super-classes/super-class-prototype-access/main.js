class SuperAccess {
	prop = {};
	method() {}
}
class Access extends SuperAccess {}

Access.prototype.doesNoExist;
Access.prototype.doesNoExist.throws;
Access.prototype.method.doesNoExist;
Access.prototype.method.doesNoExist.throws;
Access.prototype.prop.throws;
