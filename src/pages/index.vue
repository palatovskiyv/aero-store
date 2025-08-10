<script setup>
import { useHead } from '#imports'

useHead({
  title: 'Квадрокоптеры DJI — В наличии FPV, Mavic, Avata, Mini, Agras',
  meta: [
    { name: 'description', content: 'Купить квадрокоптер DJI: Mavic, Mini, Avata, FPV, Agras, Matrice, Flip, Neo. Камеры, аксессуары, системы РЭБ и детекторы дронов — в наличии на Aerostore.tech' },
  ]
})

const { $directus, $readItem } = useNuxtApp()

const { data: config } = await useAsyncData('config', () => {
  return $directus.request($readItem('config', 1, {
    fields: ['novelty.*', 'discount.*', 'hero_models.*', 'novelty.images.*', 'discount.images.*', 'hero_products.*', 'hero_products.product.*'],
  }))
})
</script>

<template>
  <div>
    <Hero :products="config.hero_products" />
    <CardsGrid :items="config.hero_models" />
    <WhyWe />
    <ProductsSlider :products="config.novelty" title="Новинки" button-title="Все новинки" />
    <ProductsSlider :products="config.discount" title="Скидки" button-title="Все скидки" />
    <Location />
  </div>
</template>
