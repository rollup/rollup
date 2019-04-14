// TODO Lukas entry not found -> unhandled Promise rejection?
module.exports = {
	description: 'allows adding modules already in the graph as entry points',
	options: {
		input: {
			'first-main': 'main1',
			'second-main': 'main2'
		},
		plugins: {
			buildStart() {
				// it should be possible to add existing entry points while not overriding their alias
				this.addEntry('main1');

				// if an existing dependency is added, all references should use the new name
				this.addEntry('dep.js');
				this.addEntry('dep');
			}
		}
	}
};
