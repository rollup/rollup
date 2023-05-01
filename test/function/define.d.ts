import type { TestConfigFunction } from '../types';

declare global {
	function defineTest(config: TestConfigFunction): TestConfigFunction;
}
