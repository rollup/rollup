const withoutPrototype = { __proto__: null, existing: 1 };

// Even when the called property cannot be resolved, the arguments are still
// evaluated at runtime and their side effects need to be retained.
undefined(console.log('namespace argument'));
withoutPrototype.missing(console.log('prototype-less argument'));
