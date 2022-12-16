import { sideEffects } from './sideEffects';

export function sideEffectFunction() {
	sideEffects.push('fn called');
}
