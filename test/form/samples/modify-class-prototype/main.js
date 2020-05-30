class Removed {}
Removed.prop = 42;
Removed.prototype.prop = 43;
Removed.prototype.prop2 = Removed.prototype.prop;

export class Retained {}
Retained.prop = 42;
Retained.prototype.prop = 43;
Retained.prototype.prop2 = Retained.prototype.prop;
