import { Context } from 'hono'
import { html, raw } from 'hono/html'

type button = {
  text: string
  link?: boolean
}

type renderFrameOptions = {
  image: string
  postUrl: string
  showTextInput: boolean
  buttons: button[]
}

export const renderFrame = (c: Context, opts: renderFrameOptions) =>
  c.html(
    html`<html>
      <title>Seedbucks</title>
      <meta property="fc:frame" content="vNext" />
      <meta property="og:image" content="${opts.image}" />
      <meta property="fc:frame:image" content="${opts.image}" />
      <meta property="fc:frame:post_url" content="${opts.postUrl}" />
      ${opts.showTextInput
        ? raw(
            `<meta property="fc:frame:input:text" content="Enter seed phrase to mint" />`,
          )
        : ''}
      ${opts.buttons.map((button, i) => {
        const idx = i + 1
        return raw(
          `
          <meta property="fc:frame:button:${idx}:action" content="${
            button.link ? 'post_redirect' : 'post'
          }" /> 
          <meta property="fc:frame:button:${idx}" content="${button.text}" />`,
        )
      })}
      <body></body>
      <script>
        window.location.href = 'https://warpcast.com/worm.eth/0x2f7eb39e'
      </script>
    </html>`.toString(),
  )
