import { p as preload } from './generated-preload.js';

await preload(() => import('./generated-entry.js'));

function App() {
	return 'App';
}

var app = /*#__PURE__*/Object.freeze({
	__proto__: null,
	default: App
});

export { app as a };
