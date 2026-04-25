import dauphaihau from '@dauphaihau/eslint-config';
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

export default defineConfig([
  ...(await dauphaihau({
    react: true,
    tailwind: true,
    typescript: true,
  })),
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
      '@stylistic/operator-linebreak': ['error', 'after', { overrides: { '|': 'before', '?': 'before', ':': 'before' } }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'atlas/lucide-icon-suffix': 'error',
      'react/no-unescaped-entities': 'off',
    },
  },
]);
