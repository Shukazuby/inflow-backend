export const CommentResponseSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: 'clgk29u8h0000356cpzjh5v2k',
    },
    content: {
      type: 'string',
      example: 'Great post! Thanks for sharing this information.',
    },
    postId: {
      type: 'string',
      example: 'clgk29u8h0000356cpzjh5v2k',
    },
    userId: {
      type: 'string',
      example: 'clgk29u8h0000356cpzjh5v2k',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
    user: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          example: 'clgk29u8h0000356cpzjh5v2k',
        },
        username: {
          type: 'string',
          example: 'crypto_enthusiast',
        },
        avatarUrl: {
          type: 'string',
          nullable: true,
          example: 'https://example.com/avatar.jpg',
        },
      },
    },
  },
}; 