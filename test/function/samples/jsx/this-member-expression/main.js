class Component {
	Comp = 'Comp';
	nested = { Inner: 'Inner' };
	renderInField = () => <this.Comp />;

	render() {
		return <this.Comp />;
	}

	renderInArrow() {
		return (() => <this.nested.Inner />)();
	}
}

const component = new Component();
assert.strictEqual(component.render(), 'Comp');
assert.strictEqual(component.renderInArrow(), 'Inner');
assert.strictEqual(component.renderInField(), 'Comp');

const config = {
	ui: { Comp: 'ObjectComp', Other: 'unused' },
	get view() {
		return <this.ui.Comp />;
	}
};
assert.strictEqual(config.view, 'ObjectComp');
