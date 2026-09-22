import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

/**
 * eslint-config-next ships a native flat config that already bundles
 * next/typescript, so no @eslint/eslintrc compat bridge is needed.
 */
const eslintConfig = [
  { ignores: ['.next/**', 'out/**', 'node_modules/**', 'design-export/**'] },
  ...nextCoreWebVitals,
];

export default eslintConfig;
