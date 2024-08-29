import globals from "globals";
import pluginJs from "@eslint/js";

export default [
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    {
        rules: {
            quotes: ["error", "double"],
            indent: ["error", 4],
            semi: ["error", "always"],
            "object-curly-spacing": ["error", "always"]
        }
    }
];
