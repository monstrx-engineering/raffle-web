module.exports = {
	extends: [
		"mantine",
		"plugin:@next/next/recommended",
		"plugin:jest/recommended",
		"plugin:storybook/recommended",
		"plugin:prettier/recommended",
	],
	plugins: ["testing-library", "jest"],
	overrides: [
		{
			files: ["**/?(*.)+(spec|test).[jt]s?(x)"],
			extends: ["plugin:testing-library/react"],
		},
	],
	parserOptions: {
		project: "./tsconfig.json",
	},
	settings: {
		"import/extensions": [".js", ".jsx", ".ts", ".tsx"],
		"import/parsers": {
			"@typescript-eslint/parser": [".ts", ".tsx"]
		},
		"import/resolver": {
			typescript: {},
			alias: {
				map: [['~', '.']],
				extensions: ['.ts', '.js', '.tsx'],
			}
		}
	},
	rules: {
		"react/react-in-jsx-scope": "off",
	},
};
