import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

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
            if (node.source.value !== 'lucide-react') return

            for (const specifier of node.specifiers) {
              if (specifier.type !== 'ImportSpecifier') continue
              if (specifier.importKind === 'type') continue

              const localName = specifier.local.name
              if (localName.endsWith('Icon')) continue

              context.report({
                node: specifier.local,
                messageId: 'requireSuffix',
                data: {
                  suggested: `${localName}Icon`,
                },
              })
            }
          },
        }
      },
    },
  },
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      atlas: atlasRules,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'atlas/lucide-icon-suffix': 'error',
    },
  },
])
