import type { TestConfigSourcemap } from '../types';

declare global {
	function defineTest(config: TestConfigSourcemap): TestConfigSourcemap;
}
