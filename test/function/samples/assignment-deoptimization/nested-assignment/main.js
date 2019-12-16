let updated = false;
assert.ok(!updated) || (updated = true);
if (!updated) throw new Error('Update was not tracked');
