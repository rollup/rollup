module.exports = defineTest({
	description: 'includes used dynamic import properties with await',
	async exports({ assertImport }) {
		await assertImport();
	}
});
