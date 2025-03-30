import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import { Linter } from 'eslint';

export default [
	{
		ignores: ['node_modules', 'dist', 'build', 'out', 'coverage'],
	},
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{ languageOptions: { globals: globals.browser } },
	// extends prettier
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	eslintConfigPrettier,
	{ rules: { '@typescript-eslint/no-explicit-any': 'off' } },
] as Linter.FlatConfig[];
