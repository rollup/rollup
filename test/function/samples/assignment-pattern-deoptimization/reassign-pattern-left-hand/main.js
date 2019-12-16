let modified = false;
({foo: modified = false} = {foo: true});

if (!modified) assert.fail('reassignment was not tracked');
