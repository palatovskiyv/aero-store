import { defineNuxtPlugin } from '#app'
import { createDirectus, createItem, readItem, readItems, rest } from '@directus/sdk'

const directus = createDirectus('https://api.aerostore.tech').with(rest({ credentials: 'include' }))

export default defineNuxtPlugin(() => {
  return {
    provide: { directus, readItem, readItems, createItem },
  }
})
