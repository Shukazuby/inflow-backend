export const PostDetailSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: 'clgk29u8h0000356cpzjh5v2k',
    },
    content: {
      type: 'string',
      example: 'This is a post about blockchain technology',
    },
    media: {
      type: 'string',
      nullable: true,
      example: 'https://example.com/image.jpg',
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
      },
      example: ['blockchain', 'nft', 'crypto'],
    },
    category: {
      type: 'string',
      example: 'tech',
    },
    visibility: {
      type: 'string',
      example: 'public',
    },
    isMinted: {
      type: 'boolean',
      example: true,
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
    _count: {
      type: 'object',
      properties: {
        tips: {
          type: 'number',
          example: 5,
        },
      },
    },
    nftMetadata: {
      type: 'object',
      nullable: true,
      properties: {
        tokenId: {
          type: 'string',
          example: 'token-123456',
        },
        contractAddress: {
          type: 'string',
          example: '0x1234567890abcdef1234567890abcdef12345678',
        },
        chain: {
          type: 'string',
          example: 'ethereum',
        },
        mintedAt: {
          type: 'string',
          format: 'date-time',
        },
        owner: {
          type: 'string',
          example: '0xabcdef1234567890abcdef1234567890abcdef12',
        },
      },
    },
  },
};
