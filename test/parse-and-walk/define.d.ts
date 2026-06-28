import type { TestConfigParseAndWalk } from '../types';

declare global {
	function defineTest(config: TestConfigParseAndWalk): TestConfigParseAndWalk;
}
