import { Hono } from 'hono'
import { isAddress } from 'viem'
import { HTTPException } from 'hono/http-exception'
import { serveStatic } from 'hono/cloudflare-workers'

import {
  FrameRequest,
  FrameValidationData,
  getFrameMessage,
} from '@coinbase/onchainkit'
import { renderFrame } from './common'
import {
  FrameButton,
  FrameHandler,
  handleMint,
  images,
  noop,
  externalHostname,
  shareLink,
  viewTransaction,
} from './frameActions'

declare module 'hono' {
  interface ContextVariableMap {
    message: FrameValidationData
  }
}
const app = new Hono()
app.get('/static/*', serveStatic({ root: './' }))

app.get('/', (c) => {
  const { ref } = c.req.query()
  let postUrl = `${externalHostname}/frame/mint`
  if (isAddress(ref)) {
    postUrl += `?ref=${ref}`
  }
  return renderFrame(c, {
    image: images.mint,
    postUrl,
    showTextInput: false,
    buttons: [
      // { text: 'Mint' },
      // // { text: 'View leaderboard', link: true },
      // { text: 'Share referral link (💻 only)', link: true },
    ],
  })
})

app.use('/frame/*', async (c, next) => {
  const body: FrameRequest = await c.req.json()
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: c.env!.NEYNAR_API_KEY as string,
  })

  if (!isValid || message === undefined) {
    throw new HTTPException(400, { message: 'Invalid request' })
  }

  c.set('message', message)
  await next()
})

app.post('/frame/mint', async (c) => {
  const message = c.get('message')
  const buttonMappings: Record<FrameButton, FrameHandler> = {
    1: handleMint,
    2: shareLink,
    3: noop,
    4: noop,
  }

  const button = message.button as FrameButton

  return buttonMappings[button](c, message)
})

app.post('/frame/successfulMint', async (c) => {
  const message = c.get('message')
  const buttonMappings: Record<FrameButton, FrameHandler> = {
    1: viewTransaction,
    2: shareLink,
    3: noop,
    4: noop,
  }
  const button = message.button as FrameButton

  return buttonMappings[button](c, message)
})

app.post('/frame/alreadyMinted', async (c) => {
  const message = c.get('message')
  const buttonMappings: Record<FrameButton, FrameHandler> = {
    1: shareLink,
    2: noop,
    3: noop,
    4: noop,
  }
  const button = message.button as FrameButton

  return buttonMappings[button](c, message)
})

export default app
