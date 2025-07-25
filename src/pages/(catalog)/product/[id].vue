<script setup>
import ProductCard from '~/components/ProductCard.vue'

const { params } = useRoute()
const { $directus, $readItem } = useNuxtApp()

// Extract the actual product ID from the slug (format: product-name-123)
function extractProductId(slug) {
  // Get the last part after the last hyphen which should be the ID
  const parts = slug.split('-')
  return parts[parts.length - 1]
}

const productId = extractProductId(params.id)

// Fetch product data from Directus using the extracted product ID
const { data: product } = await useAsyncData(`product-${productId}`, () => {
  return $directus.request($readItem('products', productId, {
    fields: ['*', 'images.id', 'images.directus_files_id', 'model.*', 'model.type.*', 'specifications.*', 'specifications.specification.*'],
  }))
})
</script>

<template>
  <UiContainer class="product-page">
    <ProductCard :product="product" />
  </UiContainer>
</template>

<style scoped>
.product-page {
  margin-top: 160px;

  @media (max-width: 1165px) {
    margin-top: 66px;
  }
}
</style>
