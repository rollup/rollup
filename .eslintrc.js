module.exports = {
	env: {
		browser: true,
		es6: true,
		node: true
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
		'plugin:prettier/recommended',
		'plugin:import/recommended',
		'plugin:import/typescript',
		'plugin:unicorn/recommended'
	],
	ignorePatterns: [
		'node_modules',
		'dist',
		'perf',
		'tmp',
		'coverage',
		'_tmp',
		'cache',
		'native.d.ts',
		'/test/*/samples/**/*.*',
		'!/test/*/samples/**/_config.js',
		'!/test/*/samples/**/rollup.config.js',
		'!.vitepress',
		'/wasm/',
		'/wasm-node/'
	],
	overrides: [
		{
			files: ['*.js'],
			rules: {
				'@typescript-eslint/explicit-module-boundary-types': 'off',
				'unicorn/no-process-exit': 'off',
				'unicorn/prefer-module': 'off'
			}
		},
		{
			files: ['./*.ts', 'cli/**/*.ts'],
			rules: {
				'unicorn/no-process-exit': 'off'
			}
		},
		{
			files: ['*.js', 'cli/**/*.ts'],
			rules: {
				'@typescript-eslint/no-var-requires': 'off'
			}
		},
		{
			env: {
				mocha: true
			},
			files: ['test/**/*.js'],
			rules: {
				'sort-keys': 'off'
			}
		},
		{
			extends: [
				'plugin:vue/vue3-essential',
				'@vue/eslint-config-typescript/recommended',
				'@vue/eslint-config-prettier'
			],
			files: ['*.vue']
		},
		{
			files: ['docs/repl/examples/**/*.js'],
			rules: {
				'import/namespace': 'off',
				'import/no-unresolved': 'off',
				'no-undef': 'off',
				'unicorn/prevent-abbreviations': 'off'
			}
		},
		{
			files: ['test/**/_config.js'],
			rules: {
				'no-undef': 'off'
			}
		}
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	rules: {
		'@typescript-eslint/consistent-type-assertions': [
			'error',
			{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }
		],
		'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
		'@typescript-eslint/consistent-type-imports': 'error',
		'@typescript-eslint/member-ordering': [
			'error',
			{
				default: {
					memberTypes: [],
					order: 'alphabetically'
				}
			}
		],
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_', ignoreRestSiblings: true, varsIgnorePattern: '^_' }
		],
		'arrow-body-style': ['error', 'as-needed'],
		'dot-notation': 'error',
		'import/no-unresolved': [
			'error',
			{
				// 'fsevents' is only available on macOS, and not installed on linux/windows
				ignore: [
					'fsevents',
					'help.md',
					'is-reference',
					'package.json',
					'types',
					'examples.json',
					'locate-character'
				]
			}
		],
		'import/order': ['error', { alphabetize: { order: 'asc' } }],
		'no-constant-condition': ['error', { checkLoops: false }],
		'no-prototype-builtins': 'off',
		'object-shorthand': 'error',
		'prefer-const': ['error', { destructuring: 'all' }],
		'prefer-object-spread': 'error',
		'sort-imports': [
			'error',
			{
				ignoreCase: true,
				ignoreDeclarationSort: true,
				ignoreMemberSort: false
			}
		],
		'sort-keys': ['error', 'asc', { caseSensitive: false }],
		'unicorn/consistent-destructuring': 'off',
		'unicorn/filename-case': 'off',
		'unicorn/no-array-callback-reference': 'off',
		'unicorn/no-array-reduce': 'off',
		'unicorn/no-await-expression-member': 'off',
		'unicorn/no-empty-file': 'off',
		'unicorn/no-for-loop': 'off',
		'unicorn/no-nested-ternary': 'off',
		'unicorn/no-null': 'off',
		'unicorn/no-this-assignment': 'off',
		'unicorn/no-useless-undefined': 'off',
		'unicorn/number-literal-case': 'off',
		'unicorn/prefer-at': 'off',
		'unicorn/prefer-code-point': 'off',
		'unicorn/prefer-math-trunc': 'off',
		'unicorn/prefer-number-properties': 'off',
		'unicorn/prefer-string-raw': 'off',
		'unicorn/prefer-string-replace-all': 'off',
		'unicorn/prefer-structured-clone': 'off',
		'unicorn/prefer-top-level-await': 'off',
		'unicorn/prevent-abbreviations': ['error', { replacements: { dir: false } }]
	}
};
