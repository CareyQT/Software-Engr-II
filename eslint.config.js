import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import { defineConfig } from 'eslint/config'

import path from 'path'
import { fileURLToPath } from 'url'

import prettier from 'eslint-plugin-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import next from '@next/eslint-plugin-next'

import js from '@eslint/js'

import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default defineConfig([
  {
    extends: [...nextCoreWebVitals, ...compat.extends('prettier')],

    plugins: {
      prettier,
      reactHooks,
      next,
    },

    ignores: [
      'node_modules',
      '.next',
      '.vscode',
      '.prettierignore',
      '.prettierrc',
      '.eslintrc',
      'eslint.config.js',
      '.nvmrc',
      '.watchmanconfig',
      '_dev.sh',
      '_prod.sh',
      'COMMIT_GUIDE.md',
      'components.json',
      'next-env.d.ts',
      'next.config.ts',
      'tsconfig.json',
      'postcss.config.mjs',
      'vercel.json',
      'environment.d.ts',
    ],

    rules: {
      'prettier/prettier': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      'import/order': [
        1,
        {
          groups: ['external', 'builtin', 'internal', 'sibling', 'parent', 'index'],

          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'next/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@clerk/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@hookform/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@tanstack/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/components/**',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '@/hooks/**',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '@/interfaces/**',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '@/layouts/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '@/lib/**',
              group: 'internal',
            },
            {
              pattern: '@/models/**',
              group: 'internal',
            },
            {
              pattern: '@/schemas/**',
              group: 'internal',
            },
            {
              pattern: '@/styles/**',
              group: 'internal',
            },
            {
              pattern: '@/utils/**',
              group: 'internal',
            },
          ],

          pathGroupsExcludedImportTypes: ['internal'],

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
])
