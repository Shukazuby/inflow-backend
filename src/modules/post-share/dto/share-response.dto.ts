/**
 * Defines the structure of the data object in a successful share response.
 */
class ShareResponseDataDto {
  /**
   * The ID of the post that was shared.
   * @example '123e4567-e89b-12d3-a456-426614174000'
   */
  postId: string;

  /**
   * The new total share count for the post.
   * @example 45
   */
  shareCount: number;

  /**
   * The ID of the newly created share activity record.
   * @example 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
   */
  shareId: string;

  /**
   * A confirmation message.
   * @example 'Share recorded successfully'
   */
  message: string;
}

/**
 * Defines the overall structure of a successful response for a share action.
 */
export class ShareResponseDto {
  /**
   * Indicates if the request was successful.
   * @example true
   */
  success: boolean;

  /**
   * The data payload of the response.
   */
  data: ShareResponseDataDto;
}
