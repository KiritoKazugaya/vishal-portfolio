import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // react-three-fiber's whole model is imperative mutation of Three.js
    // objects inside the render loop (camera.position.x = ..., material
    // .emissiveIntensity = ...). The React Compiler immutability rules read
    // that as a violation, but going through React state here would mean a
    // re-render every frame — exactly what the store exists to avoid.
    files: ["components/chip/**/*.tsx"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
