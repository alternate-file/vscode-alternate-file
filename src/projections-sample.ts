import * as Projection from './Projection';

export const projections: Projection.t = {
  "src/*.js": { alternate: "src/test/*.test.js" },
  "src/*.jsx": { alternate: "src/test/*.test.jsx" },
  "src/*.ts": { alternate: "src/test/*.test.ts" },
  "src/*.tsx": { alternate: "src/test/*.test.tsx" },
  "app/*.rb": { alternate: "test/*_spec.rb" }
};
