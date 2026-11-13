class Component {
	render() {
		return <this.Comp></this.Comp>;
	}
}

const config = {
	ui: { Comp: 'used'},
	get view() {
		return <this.ui.Comp />;
	}
};

const view = config.view;

const render = () => <undefined.Comp />;

export { Component, render, view };
