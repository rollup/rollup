module.exports = defineTest({
	description:
		'does not treat an object mutated after being returned from an assignment expression as unmodified when the assignment target is a destructuring pattern'
});
