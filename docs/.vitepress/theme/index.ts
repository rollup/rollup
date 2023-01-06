import DefaultTheme from 'vitepress/theme';
import './custom.css';
import { createPinia } from 'pinia';

const pinia = createPinia();
const theme: typeof DefaultTheme = {
	...DefaultTheme,
	enhanceApp(context) {
		context.app.use(pinia);
	}
};

export { theme as default };
