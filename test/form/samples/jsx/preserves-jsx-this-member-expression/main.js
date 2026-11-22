export class Component {
	render() {
		return <this.Comp></this.Comp>;
	}
}

const config = {
	ui: { Comp: 'used', Other: 'dropped' },
	get view() {
		return <this.ui.Comp />;
	}
};

export const view = config.view;

export const render = () => <this.Comp />;
