import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Schema for the paginated feed response
 */
export const FeedResponseSchema: SchemaObject = {
  properties: {
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          media: { type: 'string', nullable: true },
          tags: { type: 'array', items: { type: 'string' } },
          category: { type: 'string' },
          visibility: { type: 'string' },
          isMinted: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              avatarUrl: { type: 'string', nullable: true },
            },
          },
          _count: {
            type: 'object',
            properties: {
              tips: { type: 'integer' },
            },
          },
        },
      },
    },
    meta: {
      type: 'object',
      properties: {
        currentPage: { type: 'integer' },
        itemsPerPage: { type: 'integer' },
        totalItems: { type: 'integer' },
        totalPages: { type: 'integer' },
        hasNextPage: { type: 'boolean' },
        hasPreviousPage: { type: 'boolean' },
      },
    },
  },
};
