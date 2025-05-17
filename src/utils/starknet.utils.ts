import { ec, hash } from 'starknet';

// Make a type union of the 2 signature shapes and export
export type StarknetSignature = string | [string, string];

// Narrow at runtime: “[rHex, sHex]” form vs single-hex form
function isTuple(sig: StarknetSignature): sig is [string, string] {
  return Array.isArray(sig) && sig.length === 2;
}

/**
 * Verifies a Starknet message signature.
 * @param nonce – the original message/nonce
 * @param signature – either a single‑hex string or [r, s] tuple
 * @param address – the signer’s public key (wallet address)
 * @returns true if the signature is valid, false otherwise
 */
export function verifySignature(
  nonce: string,
  signature: StarknetSignature,
  address: string,
) {
  // const messageHash = hash.starknetKeccak(nonce);
  // const msgHash = '0x' + messageHash.toString(16);
  const messageHash = hash.keccakBn(nonce);

  if (isTuple(signature)) {
    // Convert ["rHex","sHex"] to
    let sigHex = signature[0] + signature[1].replace(/^0x/, '');
    return ec.starkCurve.verify(sigHex, messageHash, address);
  } else {
    return ec.starkCurve.verify(signature, messageHash, address);
  }
}
