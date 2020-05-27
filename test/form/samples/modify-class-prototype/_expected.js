class Retained {}
Retained.prop = 42;
Retained.prototype.prop = 43;
Retained.prototype.prop2 = Retained.prototype.prop;

export { Retained };
