class Broken {
}

Broken.doSomething = function() { console.log('broken'); };

Broken.doSomething();

class Other {
}

Other.doSomething = function() { console.log('other'); };

export { Other as a, Broken as b };
