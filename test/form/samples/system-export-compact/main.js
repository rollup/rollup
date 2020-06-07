export let a, b;

[{ b: a = a-- }] = { b: b-- };

export { b as c}
