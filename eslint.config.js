import dauphaihauConfig from '@dauphaihau/eslint-config';
import { defineConfig } from 'eslint/config';

const atlasRules = {
  rules: {
    'lucide-icon-suffix': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Require lucide-react icons to use a local name ending with Icon',
        },
        schema: [],
        messages: {
          requireSuffix:
            'lucide-react icons must use a local name ending with "Icon". Use "{{suggested}}" instead.',
        },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            if (node.source.value !== 'lucide-react') return;

            for (const specifier of node.specifiers) {
              if (specifier.type !== 'ImportSpecifier') continue;
              if (specifier.importKind === 'type') continue;

              const localName = specifier.local.name;
              if (localName.endsWith('Icon')) continue;

              context.report({
                node: specifier.local,
                messageId: 'requireSuffix',
                data: {
                  suggested: `${localName}Icon`,
                },
              });
            }
          },
        };
      },
    },
  },
};

const dauphaihauConfigs = await dauphaihauConfig();
const checkFilePlugin = dauphaihauConfigs.find((config) => config.plugins?.['check-file'])
  ?.plugins['check-file'];

export default defineConfig([
  ...dauphaihauConfigs,
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      'check-file': checkFilePlugin,
    },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        { '**/*': 'KEBAB_CASE' },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
  {
    files: [
      '**/main.tsx',
      '**/pages/**/page.tsx',
      '**/components/ui/*.tsx',
      '**/shared/lib/query-provider.tsx',
    ],
    rules: {
      'check-file/filename-naming-convention': 'off',
    },
  },
  {
    files: ['**/components/ui/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      atlas: atlasRules,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      'atlas/lucide-icon-suffix': 'error',
      'react/no-unescaped-entities': 'off',
    },
  },
  // Backend API types use snake_case field names and structural `data` wrappers
  {
    files: [
      '**/shared/api/**/*.ts',
      '**/shared/lib/api-client.ts',
      '**/shared/lib/echo.ts',
    ],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      'id-denylist': 'off',
    },
  },
  // Queries access backend response shapes (e.g. `.data` from paginated responses)
  {
    files: ['**/shared/queries/**/*.ts'],
    rules: {
      'id-denylist': 'off',
    },
  },
]);
