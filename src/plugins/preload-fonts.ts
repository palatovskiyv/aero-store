export default defineNuxtPlugin((nuxtApp) => {
  const headData = {
    link: [
      {
        rel: 'preload',
        href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap',
        as: 'style',
        crossorigin: true
      },
      {
        rel: 'preload',
        href: 'https://fonts.googleapis.com/css2?family=Unbounded:wght@200..900&display=swap',
        as: 'style',
        crossorigin: true
      }
    ]
  }

  if (process.server) {
    nuxtApp.ssrContext?.event.node.res.setHeader(
      'Link',
      headData.link.map(link => `<${link.href}>; rel=${link.rel}; as=${link.as}; crossorigin=${link.crossorigin ? 'true' : 'false'}`)
    )
  }
}) 