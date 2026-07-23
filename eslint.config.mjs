import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: [
            "node_modules/",
            "dist/",
            "out/",
            "lib/",
            "eslint.config.mjs",
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // Match the project's existing style

            // TypeScript rules
            "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/no-inferrable-types": ["error", { ignoreParameters: true }],
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
            "@typescript-eslint/prefer-for-of": "error",

            // Disable rules that conflict with the existing codebase
            "@typescript-eslint/no-require-imports": "error",
            "@typescript-eslint/no-shadow": "error",
            "no-shadow": "off",

            // Core rules matching existing style
            "eqeqeq": ["error", "smart"],
            "no-console": "error",
            "curly": "error",
            "no-constructor-return": "error",

            // Disable rules that would require extensive refactoring
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-call": "off",
            "@typescript-eslint/no-unsafe-argument": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-base-to-string": "off",
        },
    },
);
