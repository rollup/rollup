import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client';
import '@shikijs/vitepress-twoslash/style.css';
import { createPinia } from 'pinia';
import defaultTheme from 'vitepress/theme';
import './custom.css';

const pinia = createPinia();
const theme: typeof defaultTheme = {
	...defaultTheme,
	enhanceApp(context) {
		context.app.use(pinia);
		context.app.use(TwoslashFloatingVue);
	}
};

export { theme as default };
