export let a, b;

[{ b: a = a-- }] = { b: b-- }, [a] = [1];

export { b as c };
