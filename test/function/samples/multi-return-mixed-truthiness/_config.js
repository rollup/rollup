module.exports = defineTest({
	description:
		'does not fold a condition when an earlier return is a truthy literal and a later return may be falsy (#6491)'
});
