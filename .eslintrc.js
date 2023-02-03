module.exports = {
	root: true,
	extends: [
		'mantine',
		'plugin:@next/next/recommended',
		'plugin:jest/recommended',
		'plugin:storybook/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:prettier/recommended',
	],
	plugins: ['testing-library', 'jest', '@typescript-eslint', 'import'],
	overrides: [
		{
			files: ['**/?(*.)+(spec|test).[jt]s?(x)'],
			extends: ['plugin:testing-library/react'],
		},
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: './',
	},
	settings: {
		'import/resolver': {
			typescript: {},
		},
	},
	rules: {
		'react/react-in-jsx-scope': 'off',
		'@typescript-eslint/no-unused-vars': [2, { argsIgnorePattern: '^_' }],
		'@typescript-eslint/no-non-null-assertion': 'off',
		'prefer-const': 'off',
	},
};
