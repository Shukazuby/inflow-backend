/**
 * Interface for NFT metadata
 */
export interface NFTMetadata {
  tokenId: string;
  contractAddress: string;
  chain: string;
  mintedAt: Date;
  owner: string;
}

/**
 * Interface for detailed post response including NFT metadata
 */
export interface PostDetail {
  id: string;
  content: string;
  media?: string | null;
  tags: string[];
  category: string;
  visibility: string;
  isMinted: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
  _count?: {
    tips: number;
  };
  nftMetadata: NFTMetadata | null;
}
