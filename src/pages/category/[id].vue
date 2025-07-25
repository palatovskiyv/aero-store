<script setup lang="ts">
const { $directus, $readItem } = useNuxtApp()
const route = useRoute()
const categoryId = route.params.id as string

const selectedTypeId = computed(() => Number(categoryId!.split('-')?.at(-1)))

const { data: category } = await useAsyncData(`types${selectedTypeId.value}`, () => {
  return $directus.request($readItem('types', selectedTypeId.value, {
    fields: ['*', 'models.*'],
  }))
})

const { data: config } = await useAsyncData('config', () => {
  return $directus.request($readItem('config', 1, {
    fields: ['novelty.*', 'discount.*', 'hero_models.*', 'novelty.images.*', 'discount.images.*', 'hero_products.*', 'hero_products.product.*'],
  }))
})
</script>

<template>
  <div class="category">
    <h1 class="category__title">
      {{ category!.title }}
    </h1>
    <CardsGrid :items="category!.models" />
    <ProductsSlider :products="config!.novelty" title="Новинки" button-title="Все новинки" />
    <ProductsSlider :products="config!.discount" title="Скидки" button-title="Все скидки" />
    <Location />
  </div>
</template>

<style lang="scss" scoped>
.category {
  margin-top: 142px;

  &__title {
    text-align: center;
    margin: 0 auto;
    max-width: 1166px;
    text-transform: uppercase;
  }
}
</style>
