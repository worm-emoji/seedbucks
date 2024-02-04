import { FrameValidationData } from '@coinbase/onchainkit'
import { Context } from 'hono'
import qs from 'qs'
import { HTTPException } from 'hono/http-exception'
import {
  Account,
  Address,
  EstimateGasExecutionError,
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  zeroAddress,
} from 'viem'
import { mnemonicToAccount, privateKeyToAccount } from 'viem/accounts'
import { signMsg, chain, contract } from './contract'
import abi from './abi'
import { renderFrame } from './common'

export type FrameButton = 1 | 2 | 3 | 4
export type FrameHandler = (
  c: Context,
  message: FrameValidationData,
) => Promise<Response>

export const externalHostname = 'https://seedbucks.xyz'

export const images = {
  mint: `https://seedbucks.xyz/static/share.png`,
  successfulMint: `https://seedbucks.xyz/static/minted.png`,
  missingSeed: `https://seedbucks.xyz/static/missingseed.png`,
  alreadyMinted: `https://seedbucks.xyz/static/alreadyminted.png`,
  notEnoughEth: `https://seedbucks.xyz/static/notenougheth.png`,
}

export const handleMint = async (c: Context, message: FrameValidationData) => {
  const { ref } = c.req.query()

  const fid = message.interactor.fid
  let account: Account
  try {
    account = mnemonicToAccount(message.input.trim())
  } catch (e) {
    return renderFrame(c, {
      image: images.missingSeed,
      postUrl: `${externalHostname}/frame/mint`,
      showTextInput: true,
      buttons: [{ text: 'Mint' }, { text: 'Share referral link', link: true }],
    })
  }
  const sig = await signMsg(
    fid,
    account.address,
    privateKeyToAccount(c.env!.SIGNER as Address),
  )

  const transport = http(c.env!.RPC_URL as string)
  const publicClient = createPublicClient({ transport, chain })

  const client = createWalletClient({
    account,
    transport,
    chain,
  })

  const referral = isAddress(ref) ? ref : zeroAddress

  try {
    const { request } = await publicClient.simulateContract({
      address: contract,
      abi,
      functionName: 'mint',
      args: [fid, referral, sig],
      account,
      chain,
    })

    // const tx = await client.writeContract(request)
    const tx = '0x1234'
    return renderFrame(c, {
      image: images.successfulMint,
      postUrl: `${externalHostname}/frame/successfulMint?minter=${account.address}&tx=${tx}`,
      showTextInput: false,
      buttons: [
        { text: 'View transaction', link: true },
        { text: 'Share referral link', link: true },
      ],
    })
  } catch (e) {
    const error = e as EstimateGasExecutionError
    if (error.name === 'TransactionExecutionError') {
      return renderFrame(c, {
        image: images.notEnoughEth,
        postUrl: `${externalHostname}/frame/mint`,
        showTextInput: true,
        buttons: [
          { text: 'Mint' },
          { text: 'Share referral link', link: true },
        ],
      })
    }

    if (error.name === 'ContractFunctionExecutionError') {
      return renderFrame(c, {
        image: images.alreadyMinted,
        postUrl: `${externalHostname}/frame/alreadyMinted?minter=${account.address}`,
        showTextInput: false,
        buttons: [{ text: 'Share referral link', link: true }],
      })
    }

    console.error(error.name)
    throw new HTTPException(400, { message: 'Already minted.' })
  }
}

export const shareLink = async (c: Context, message: FrameValidationData) => {
  let { minter } = c.req.query()
  if (typeof minter !== 'string') {
    minter = message.interactor.verified_accounts?.[0]
  }

  const query: Record<string, string> = {
    text: 'I just minted Seedbucks – the first ERC20 that uses Frame seed phrase as a minting mechanism. Try it out to earn $SEED',
    'embeds[]': `${externalHostname}?ref=${minter}`,
  }

  console.log(query['embeds[]'])

  return c.redirect(
    `https://warpcast.com/~/compose?${qs.stringify(query)}`,
    302,
  )
}

export const viewTransaction = async (
  c: Context,
  message: FrameValidationData,
) => {
  let { tx } = c.req.query()
  if (typeof tx !== 'string') {
    throw new HTTPException(400, { message: 'Invalid transaction' })
  }

  return c.redirect(`${chain.blockExplorers.default.url}/tx/${tx}`, 302)
}

export const noop = async (c: Context, message: FrameValidationData) => {
  return c.json({ status: false })
}