/**
 * Token contract config.
 * $PULSE on Virtuals / Base.
 */
export const TOKEN = {
  /** $PULSE token contract address (Base chain). */
  contractAddress: process.env.NEXT_PUBLIC_TOKEN_CONTRACT || '0x0f2Aec16C34D741f1fCac5479F7ef518431100dB',
  symbol: 'PULSE',
  /** Base chain */
  chainId: 8453,
} as const;

/** Whether to show token block on site (when contract is set). */
export const hasTokenContract = Boolean(TOKEN.contractAddress?.length >= 40);
