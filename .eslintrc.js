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
		'plugin:import/typescript'
	],
	ignorePatterns: [
		'node_modules/**/*.*',
		'dist/**/*.*',
		'/test/**/*.*',
		'!/test/*.js',
		'!/test/*/*.js',
		'/test/node_modules/*.*',
		'!/test/*/samples/**/_config.js'
	],
	overrides: [
		{
			files: ['*.js'],
			rules: {
				'@typescript-eslint/explicit-module-boundary-types': 'off'
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
		}
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module'
	},
	plugins: ['@typescript-eslint'],
	rules: {
		'@typescript-eslint/consistent-type-assertions': [
			'error',
			{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' }
		],
		'@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
		'@typescript-eslint/member-ordering': [
			'error',
			{
				default: {
					memberTypes: require('@typescript-eslint/eslint-plugin/dist/rules/member-ordering')
						.defaultOrder,
					order: 'alphabetically'
				}
			}
		],
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'dot-notation': 'error',
		'import/no-unresolved': [
			'error',
			{
				// 'fsevents' is ony available on macOS, and not installed on linux/windows
				ignore: ['fsevents', 'help.md', 'is-reference', 'package.json', 'types']
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
		'sort-keys': ['error', 'asc', { caseSensitive: false }]
	}
};
