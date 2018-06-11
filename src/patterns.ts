import * as AlternatePattern from './AlternatePattern';

export const patterns: AlternatePattern.t[] = [
  { src: "src/*.js", spec: "src/test/*.test.js" },
  { src: "src/*.jsx", spec: "src/test/*.test.jsx" },
  { src: "src/*.jsx", spec: "src/test/*.test.js" },
  { src: "src/*.ts", spec: "src/test/*.test.ts" },
  { src: "src/*.tsx", spec: "src/test/*.test.tsx" },
  { src: "src/*.tsx", spec: "src/test/*.test.ts" },
  { src: "src/*.tsx", spec: "src/test/*.test.jsx" },
  { src: "src/*.tsx", spec: "src/test/*.test.js" },
  { src: "app/*.rb", spec: "test/*_spec.rb" }
];
