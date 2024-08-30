import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.strict,
	...tseslint.configs.stylistic,
	...pluginVue.configs['flat/recommended'],
	{
		ignores: [
			'**/node_modules',
			'**/dist',
			'**/perf',
			'**/tmp',
			'**/coverage',
			'**/_tmp',
			'**/cache',
			'**/native.d.ts',
			'rust',
			'test/*/samples/**/*.*',
			'!test/*/samples/**/_config.js',
			'!test/*/samples/**/rollup.config.js',
			'!**/.vitepress',
			'wasm/',
			'wasm-node/'
		]
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		},
		plugins: {
			unicorn: eslintPluginUnicorn
		},
		rules: {
			'@typescript-eslint/consistent-type-assertions': [
				'error',
				{
					assertionStyle: 'as',
					objectLiteralTypeAssertions: 'allow'
				}
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
			'@typescript-eslint/no-dynamic-delete': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-invalid-void-type': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					ignoreRestSiblings: true,
					varsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/prefer-for-of': 'off',
			'@typescript-eslint/prefer-literal-enum-member': 'off',
			'dot-notation': 'error',
			'no-constant-condition': [
				'error',
				{
					checkLoops: false
				}
			],
			'no-prototype-builtins': 'off',
			'object-shorthand': 'error',
			'prefer-const': [
				'error',
				{
					destructuring: 'all'
				}
			],
			'prefer-object-spread': 'error',
			'sort-imports': [
				'error',
				{
					ignoreCase: true,
					ignoreDeclarationSort: true,
					ignoreMemberSort: false
				}
			],
			'sort-keys': [
				'error',
				'asc',
				{
					caseSensitive: false
				}
			],
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
			'unicorn/prevent-abbreviations': [
				'error',
				{
					replacements: {
						dir: false
					}
				}
			]
		}
	},
	{
		files: ['**/*.js'],
		rules: {
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-require-imports': 'off',
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
		files: ['**/*.js', 'cli/**/*.ts'],
		rules: {
			'@typescript-eslint/no-var-requires': 'off'
		}
	},
	{
		files: ['test/**/*.js'],
		languageOptions: {
			globals: {
				...globals.mocha
			}
		},
		rules: {
			'sort-keys': 'off'
		}
	},
	{
		files: ['docs/repl/examples/**/*.js'],
		rules: {
			'no-undef': 'off',
			'unicorn/prevent-abbreviations': 'off'
		}
	},
	{
		files: ['test/**/_config.js'],
		rules: {
			'no-undef': 'off'
		}
	},
	{
		files: ['*.vue', '**/*.vue'],
		languageOptions: {
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	},
	eslintPluginPrettierRecommended
);
