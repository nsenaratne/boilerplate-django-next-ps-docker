import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Feature-based architecture: imports flow one way, shared → features → app.
//   - A feature is used only through its public API (src/features/<name>/index.ts).
//   - Shared code (components, lib, config, types, hooks) never imports features or app.
//   - Features never import from app.
const featureDeepImport = {
  group: ["@/features/*/*"],
  message: "Import a feature through its public API: '@/features/<name>'.",
};

const config = [
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [featureDeepImport] }],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            featureDeepImport,
            { group: ["@/app/*", "@/app"], message: "Features must not depend on the app layer." },
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/components/**/*.{ts,tsx}",
      "src/lib/**/*.{ts,tsx}",
      "src/config/**/*.{ts,tsx}",
      "src/types/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/features", "@/app/*", "@/app"],
              message: "Shared code must not depend on features or the app layer.",
            },
          ],
        },
      ],
    },
  },
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
];

export default config;
