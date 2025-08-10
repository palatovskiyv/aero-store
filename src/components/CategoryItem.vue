<script setup lang="ts">
import { IconChevronRight } from '@tabler/icons-vue'

interface Props {
  id: string
  title: string
  background: string
}
const props = defineProps<Props>()
</script>

<template>
  <NuxtLink class="category-item">
    <div class="category-item__title">
      {{ props.title }}
    </div>
    <div class="category-item__action">
      <span>В корзину</span>
      <IconChevronRight />
    </div>
    <img class="category-item__background" :src="props.background" :alt="title">
  </NuxtLink>
</template>

<style lang="scss" scoped>
.category-item {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;

    display: flex;
    flex-direction: column;
    padding: 32px 0;
    align-items: center;
    justify-content: space-between;

    color: #fff;
    cursor: pointer;

    &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 50%;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
        z-index: -1;
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }

    &:hover::after {
        opacity: 1;
    }

    &__background {
        position: absolute;
        top: 0;
        left: 0;
        z-index: -2;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    &__title {
        font-size: 32px;
    }

    &__action {
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
    }
}
</style>
