import { shared } from './shared.js';
import { loadSettings } from './ui.js';
export function mount() {
	shared();
	loadSettings();
}
