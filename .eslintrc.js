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
		// Disabled until security issues of eslint-plugin-import have been resolved
		// 'plugin:import/recommended',
		// 'plugin:import/typescript',
		'plugin:unicorn/recommended'
	],
	ignorePatterns: [
		'node_modules',
		'dist',
		'perf',
		'tmp',
		'_tmp',
		'/test/*/samples/**/*.*',
		'!/test/*/samples/**/_config.js',
		'!/test/*/samples/**/rollup.config.js'
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
		'@typescript-eslint/consistent-type-imports': 'error',
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
		'@typescript-eslint/no-unused-vars': [
			'error',
			{ argsIgnorePattern: '^_', ignoreRestSiblings: true, varsIgnorePattern: '^_' }
		],
		'arrow-body-style': ['error', 'as-needed'],
		'dot-notation': 'error',
		// Disabled until security issues of eslint-plugin-import have been resolved
		// 'import/no-unresolved': [
		// 	'error',
		// 	{
		// 		// 'fsevents' is ony available on macOS, and not installed on linux/windows
		// 		ignore: ['fsevents', 'help.md', 'is-reference', 'package.json', 'types']
		// 	}
		// ],
		// 'import/order': ['error', { alphabetize: { order: 'asc' } }],
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
		'unicorn/filename-case': 'off',
		'unicorn/no-array-callback-reference': 'off',
		'unicorn/no-array-reduce': 'off',
		'unicorn/no-await-expression-member': 'off',
		'unicorn/no-nested-ternary': 'off',
		'unicorn/no-null': 'off',
		'unicorn/no-this-assignment': 'off',
		'unicorn/no-useless-undefined': 'off',
		'unicorn/prefer-code-point': 'off',
		'unicorn/prefer-math-trunc': 'off',
		'unicorn/prefer-number-properties': 'off',
		'unicorn/prefer-top-level-await': 'off'
	}
};
