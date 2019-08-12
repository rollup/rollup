class Broken {
}

Broken.doSomething = function() { console.log('broken'); };

Broken.doSomething();

class Other {
}

Other.doSomething = function() { console.log('other'); };

export { Broken as B, Other as O };
