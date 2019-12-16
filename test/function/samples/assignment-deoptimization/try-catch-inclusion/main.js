let updated = false;
try {
	updated = true;
} catch (err) {}

if (!updated) throw new Error('Update was not tracked');
