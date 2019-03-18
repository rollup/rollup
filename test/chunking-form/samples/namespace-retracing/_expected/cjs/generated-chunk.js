'use strict';

class Broken {
}

Broken.doSomething = function() { console.log('broken'); };

Broken.doSomething();

class Other {
}

Other.doSomething = function() { console.log('other'); };

exports.Broken = Broken;
exports.Other = Other;
