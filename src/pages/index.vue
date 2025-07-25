<script setup lang="ts">
const { $directus, $readItem } = useNuxtApp()

const { data: config } = await useAsyncData('config', () => {
  return $directus.request($readItem('config', 1, {
    fields: ['novelty.*', 'discount.*', 'hero_models.*', 'novelty.images.*', 'discount.images.*', 'hero_products.*', 'hero_products.product.*'],
  }))
})
</script>

<template>
  <div>
    <Hero :products="config!.hero_products" />
    <CardsGrid :items="config!.hero_models" />
    <WhyWe />
    <ProductsSlider :products="config!.novelty" title="Новинки" button-title="Все новинки" />
    <ProductsSlider :products="config!.discount" title="Скидки" button-title="Все скидки" />
    <Location />
  </div>
</template>
