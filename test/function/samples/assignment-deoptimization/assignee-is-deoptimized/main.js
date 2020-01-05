const flags = { updated: false };
let toBeUpdated = {};
toBeUpdated = flags;
toBeUpdated.updated = true;
if (!flags.updated) throw new Error('Update was not tracked');
