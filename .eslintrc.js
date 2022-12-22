module.exports = {
	root: true,
	extends: [
		'mantine',
		'plugin:@typescript-eslint/recommended',
		'plugin:@next/next/recommended',
		'plugin:jest/recommended',
		'plugin:storybook/recommended',
		'plugin:prettier/recommended',
	],
	plugins: ['testing-library', 'jest', '@typescript-eslint'],
	overrides: [
		{
			files: ['**/?(*.)+(spec|test).[jt]s?(x)'],
			extends: ['plugin:testing-library/react'],
		},
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: { jsx: true },
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: './tsconfig.json',
	},
	settings: {
		'import/resolver': {
			typescript: {},
			alias: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
				map: [['~', '.']],
			},
		},
	},
	rules: {
		'import/extensions': ['error', 'ignorePackages', { '': 'never' }],
		'react/react-in-jsx-scope': 'off',
	},
};
