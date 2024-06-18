import { fileURLToPath } from 'node:url'
import path from 'path'
const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
import { buildConfigWithDefaults } from '../buildConfigWithDefaults.js'
import { devUser } from '../credentials.js'

export default buildConfigWithDefaults({
  collections: [
    {
      slug: 'posts',
      hooks: {
        beforeOperation: [
          ({ req, operation, args }) => {
            if (operation === 'update') {
              const defaultIDType = req.payload.db.defaultIDType

              if (defaultIDType === 'number' && typeof args.id === 'string') {
                throw new Error('ID was not sanitized to a number properly')
              }
            }

            return args
          },
        ],
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'throwAfterChange',
          type: 'checkbox',
          defaultValue: false,
          hooks: {
            afterChange: [
              ({ value }) => {
                if (value) {
                  throw new Error('throw after change')
                }
              },
            ],
          },
        },
      ],
    },
    {
      slug: 'relation-a',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'richText',
          type: 'richText',
        },
      ],
      labels: {
        plural: 'Relation As',
        singular: 'Relation A',
      },
    },
    {
      slug: 'relation-b',
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'relationship',
          type: 'relationship',
          relationTo: 'relation-a',
        },
        {
          name: 'richText',
          type: 'richText',
        },
      ],
      labels: {
        plural: 'Relation Bs',
        singular: 'Relation B',
      },
    },
    {
      slug: 'pg-migrations',
      versions: true,
      fields: [
        {
          name: 'relation1',
          type: 'relationship',
          relationTo: 'relation-a',
        },
        {
          name: 'myArray',
          type: 'array',
          fields: [
            {
              name: 'relation2',
              type: 'relationship',
              relationTo: 'relation-b',
            },
            {
              name: 'mySubArray',
              type: 'array',
              fields: [
                {
                  name: 'relation3',
                  type: 'relationship',
                  relationTo: 'relation-b',
                  localized: true,
                },
              ],
            },
          ],
        },
        {
          name: 'myGroup',
          type: 'group',
          fields: [
            {
              name: 'relation4',
              type: 'relationship',
              relationTo: 'relation-b',
              localized: true,
            },
          ],
        },
        {
          name: 'myBlocks',
          type: 'blocks',
          blocks: [
            {
              slug: 'myBlock',
              fields: [
                {
                  name: 'relation5',
                  type: 'relationship',
                  relationTo: 'relation-a',
                },
                {
                  name: 'relation6',
                  type: 'relationship',
                  relationTo: 'relation-b',
                  localized: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      slug: 'custom-schema',
      dbName: 'customs',
      fields: [
        {
          name: 'text',
          type: 'text',
        },
        {
          name: 'localizedText',
          type: 'text',
          localized: true,
        },
        {
          name: 'relationship',
          type: 'relationship',
          hasMany: true,
          relationTo: 'relation-a',
        },
        {
          name: 'select',
          type: 'select',
          dbName: ({ tableName }) => `${tableName}_customSelect`,
          enumName: 'selectEnum',
          hasMany: true,
          options: ['a', 'b', 'c'],
        },
        {
          name: 'radio',
          type: 'select',
          enumName: 'radioEnum',
          options: ['a', 'b', 'c'],
        },
        {
          name: 'array',
          type: 'array',
          dbName: 'customArrays',
          fields: [
            {
              name: 'text',
              type: 'text',
            },
            {
              name: 'localizedText',
              type: 'text',
              localized: true,
            },
          ],
        },
        {
          name: 'blocks',
          type: 'blocks',
          blocks: [
            {
              slug: 'block',
              dbName: 'customBlocks',
              fields: [
                {
                  name: 'text',
                  type: 'text',
                },
                {
                  name: 'localizedText',
                  type: 'text',
                  localized: true,
                },
              ],
            },
          ],
        },
      ],
      versions: {
        drafts: true,
      },
    },
  ],
  globals: [
    {
      slug: 'global',
      dbName: 'customGlobal',
      fields: [
        {
          name: 'text',
          type: 'text',
        },
      ],
      versions: true,
    },
  ],
  localization: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
  },
  onInit: async (payload) => {
    await payload.create({
      collection: 'users',
      data: {
        email: devUser.email,
        password: devUser.password,
      },
    })
  },
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})

export const postDoc = {
  title: 'test post',
}
