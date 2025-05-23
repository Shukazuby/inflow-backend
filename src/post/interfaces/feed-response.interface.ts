/**
 * Interface for post data in feed responses
 */
export interface PostResponse {
  id: string;
  content: string;
  media?: string;
  tags: string[];
  category: string;
  visibility: string;
  isMinted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  _count: {
    tips: number;
  };
}

/**
 * Interface for pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Interface for paginated feed response
 */
export interface PaginatedFeedResponse {
  data: PostResponse[];
  meta: PaginationMeta;
}