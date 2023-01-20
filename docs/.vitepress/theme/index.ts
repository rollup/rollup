import { createPinia } from 'pinia';
// eslint-disable-next-line import/no-unresolved
import defaultTheme from 'vitepress/theme';
import './custom.css';

const pinia = createPinia();
const theme: typeof defaultTheme = {
	...defaultTheme,
	enhanceApp(context) {
		context.app.use(pinia);
	}
};

export { theme as default };
