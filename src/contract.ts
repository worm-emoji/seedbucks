import { encodePacked, Address, keccak256, PrivateKeyAccount } from 'viem'
import { base } from 'viem/chains'

// export const chain = devNetChain
export const chain = base
export const contract = '0x4926C0Dc9a9d4C0aFe4Aad06Cd1B7f7d170F1dfd'

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
