<script setup lang="ts">
interface Props {
  title?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="category-list">
    <h1 v-if="title" class="category-list__title">
      {{ props.title }}
    </h1>
    <div class="category-list__grid">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.category-list {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__title {
    text-transform: uppercase;
    text-align: center;
    font-size: 32px;
    font-weight: 700;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
}
</style>
