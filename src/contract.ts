import { encodePacked, Address, keccak256, PrivateKeyAccount } from 'viem'
import { base } from 'viem/chains'

// export const chain = devNetChain
export const chain = base
export const contract = '0x5b686cef77A9B5d48fFeF0632268423EC3211206'

const msgHash = (fid: number, address: Address) => {
  return {
    raw: keccak256(
      encodePacked(['uint256', 'address'], [BigInt(fid), address]),
    ),
  }
}

export const signMsg = async (
  fid: number,
  address: Address,
  signer: PrivateKeyAccount,
) => {
  const message = msgHash(fid, address)
  return signer.signMessage({ message })
}
