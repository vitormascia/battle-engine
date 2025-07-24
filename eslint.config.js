import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import stylistic from "@stylistic/eslint-plugin";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
	{
		files: ["**/*.ts"],
		languageOptions: {
			ecmaVersion: 2024,
			sourceType: "module",
			parser: tsParser,
			parserOptions: {
				project: "./tsconfig.json",
				ecmaVersion: 2024,
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
			"simple-import-sort": simpleImportSort,
			import: importPlugin,
			"@stylistic": stylistic,
		},
		rules: {
			/* Base TypeScript rules */
			...tsPlugin.configs.recommended.rules,

			/* Encourage explicitness and correctness */
			semi: ["error", "always"],
			"@typescript-eslint/explicit-function-return-type": "warn",
			"@typescript-eslint/explicit-module-boundary-types": "warn",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-unnecessary-condition": "error",
			"@typescript-eslint/require-await": "error",
			"@typescript-eslint/array-type": ["error", { default: "generic" }],
			"@typescript-eslint/no-explicit-any": "warn",

			/* Disabled/relaxed where appropriate */
			"@typescript-eslint/no-empty-interface": "off",
			"@typescript-eslint/no-misused-promises": [
				"error",
				{
					checksVoidReturn: false,
				},
			],

			/* Usage and hygiene */
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
			],
			"@typescript-eslint/no-namespace": "error",
			"@typescript-eslint/ban-ts-comment": [
				"error",
				{ "ts-expect-error": "allow-with-description" },
			],

			/* Style (prefer @stylistic plugin where possible) */
			"@stylistic/no-trailing-spaces": "error",
			"@stylistic/comma-dangle": ["error", "always-multiline"],
			"@stylistic/indent": ["error", "tab"],
			"no-multi-spaces": "error",
			"no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
			"no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
			"eol-last": ["error", "always"],
			quotes: ["error", "double", { avoidEscape: true }],
			semi: ["error", "always"],
			"comma-style": ["error", "last"],
			"max-len": [
				"error",
				{
					code: 120,
					comments: 100,
					tabWidth: 4,
					ignoreStrings: true,
					ignoreTemplateLiterals: true,
					ignoreUrls: true,
				},
			],
			"lines-between-class-members": [
				"error",
				"always",
				{ exceptAfterSingleLine: true },
			],
			"object-curly-newline": [
				"error",
				{
					ObjectExpression: {
						minProperties: 3,
						multiline: true,
						consistent: true,
					},
					ObjectPattern: {
						minProperties: 3,
						multiline: true,
						consistent: true,
					},
					ImportDeclaration: {
						minProperties: 4,
						multiline: true,
						consistent: true,
					},
					ExportDeclaration: {
						minProperties: 4,
						multiline: true,
						consistent: true,
					},
				},
			],
			"array-element-newline": ["error", "consistent"],
			"function-paren-newline": ["error", "multiline"],
			"newline-per-chained-call": ["error", { ignoreChainWithDepth: 2 }],

			/* Modern code preferences */
			"prefer-const": "error",
			"padding-line-between-statements": [
				"error",
				{ blankLine: "always", prev: "*", next: "return" },
				{
					blankLine: "always",
					prev: ["const", "let", "var"],
					next: "*",
				},
				{
					blankLine: "any",
					prev: ["const", "let", "var"],
					next: ["const", "let", "var"],
				},
				{ blankLine: "always", prev: "*", next: "if" },
				{ blankLine: "always", prev: "*", next: "for" },
				{ blankLine: "always", prev: "*", next: "while" },
				{ blankLine: "always", prev: "*", next: "function" },
				{ blankLine: "always", prev: "block-like", next: "*" },
			],

			/* Import organization */
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
			"import/first": "error",
			"import/newline-after-import": "error",
			"import/no-duplicates": "error",

			/* Optional/Contextual */
			"no-return-await": "error",
			/* Can be stylistic */
			"no-negated-condition": "off",
			"no-console": ["warn", { allow: ["warn", "error"] }],
		},
	},
	{
		files: ["**/*spec.ts"],
		languageOptions: {
			ecmaVersion: 2024,
			sourceType: "module",
			parser: tsParser,
			parserOptions: {
				project: "./tsconfig.eslint.json",
				ecmaVersion: 2024,
			},
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
			"simple-import-sort": simpleImportSort,
			import: importPlugin,
			"@stylistic": stylistic,
		},
		rules: {
			/* Base TypeScript rules */
			...tsPlugin.configs.recommended.rules,

			/* Encourage explicitness and correctness */
			semi: ["error", "always"],
			"@typescript-eslint/explicit-function-return-type": "warn",
			"@typescript-eslint/explicit-module-boundary-types": "warn",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-unnecessary-condition": "error",
			"@typescript-eslint/require-await": "error",
			"@typescript-eslint/array-type": ["error", { default: "generic" }],
			"@typescript-eslint/no-explicit-any": "warn",

			/* Disabled/relaxed where appropriate */
			"@typescript-eslint/no-empty-interface": "off",
			"@typescript-eslint/no-misused-promises": [
				"error",
				{
					checksVoidReturn: false,
				},
			],

			/* Usage and hygiene */
			"@typescript-eslint/no-unused-vars": [
				"error",
				{ varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
			],
			"@typescript-eslint/no-namespace": "error",
			"@typescript-eslint/ban-ts-comment": [
				"error",
				{ "ts-expect-error": "allow-with-description" },
			],

			/* Style (prefer @stylistic plugin where possible) */
			"@stylistic/no-trailing-spaces": "error",
			"@stylistic/comma-dangle": ["error", "always-multiline"],
			"@stylistic/indent": ["error", "tab"],
			"no-multi-spaces": "error",
			"no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
			"no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
			"eol-last": ["error", "always"],
			quotes: ["error", "double", { avoidEscape: true }],
			semi: ["error", "always"],
			"comma-style": ["error", "last"],
			"max-len": [
				"error",
				{
					code: 120,
					comments: 100,
					tabWidth: 4,
					ignoreStrings: true,
					ignoreTemplateLiterals: true,
					ignoreUrls: true,
				},
			],
			"lines-between-class-members": [
				"error",
				"always",
				{ exceptAfterSingleLine: true },
			],
			"object-curly-newline": [
				"error",
				{
					ObjectExpression: {
						minProperties: 3,
						multiline: true,
						consistent: true,
					},
					ObjectPattern: {
						minProperties: 3,
						multiline: true,
						consistent: true,
					},
					ImportDeclaration: {
						minProperties: 4,
						multiline: true,
						consistent: true,
					},
					ExportDeclaration: {
						minProperties: 4,
						multiline: true,
						consistent: true,
					},
				},
			],
			"array-element-newline": ["error", "consistent"],
			"function-paren-newline": ["error", "multiline"],
			"newline-per-chained-call": ["error", { ignoreChainWithDepth: 2 }],

			/* Modern code preferences */
			"prefer-const": "error",
			"padding-line-between-statements": [
				"error",
				{ blankLine: "always", prev: "*", next: "return" },
				{
					blankLine: "always",
					prev: ["const", "let", "var"],
					next: "*",
				},
				{
					blankLine: "any",
					prev: ["const", "let", "var"],
					next: ["const", "let", "var"],
				},
				{ blankLine: "always", prev: "*", next: "if" },
				{ blankLine: "always", prev: "*", next: "for" },
				{ blankLine: "always", prev: "*", next: "while" },
				{ blankLine: "always", prev: "*", next: "function" },
				{ blankLine: "always", prev: "block-like", next: "*" },
			],

			/* Import organization */
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
			"import/first": "error",
			"import/newline-after-import": "error",
			"import/no-duplicates": "error",

			/* Optional/Contextual */
			"no-return-await": "error",
			/* Can be stylistic */
			"no-negated-condition": "off",
			"no-console": ["warn", { allow: ["warn", "error"] }],
		},
	},
	{
		ignores: ["build/**/*", "node_modules/**/*", "*.env", "**/*.d.ts"],
	},
];
