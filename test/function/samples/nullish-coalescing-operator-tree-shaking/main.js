const a = unknownGlobal ? 0 : null;
assert.strictEqual(a ?? 2, 2);
