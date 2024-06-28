import pluginJs from "@eslint/js";

export default [
  {
    files: ["*.js", "tests/**/*.js"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2023, // Atualize conforme necessário
        sourceType: "module", // Especifique o tipo de módulo que está utilizando
      },
      globals: {
        // Defina seus globais aqui, como antes
        describe: "readonly",
        beforeEach: "readonly",
        jest: "readonly",
        test: "readonly",
        expect: "readonly",
        afterAll: "readonly",
        console: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        beforeAll: "readonly",
        afterEach: "readonly",
        it: "readonly",
      },
    },
  },
  pluginJs.configs.recommended,
];

