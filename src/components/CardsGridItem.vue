<script setup>
import { IconChevronRight } from '@tabler/icons-vue'

defineProps({
  id: String,
  image: String,
  title: String,
})
</script>

<template>
  <NuxtLink :to="`/model/${slugify(title)}-${id}`" class="cards-grid-item">
    <div :style="{ backgroundImage: `url(${imgLink(image)})` }" class="cards-grid-item__container">
      <h3 class="cards-grid-item__title">
        {{ title }}
      </h3>
      <div class="cards-grid-item__button">
        <span>Купить</span>
        <IconChevronRight color="#fff" />
        <div />
      </div>
    </div>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.cards-grid-item {
  width: 370px;
  min-height: 370px;

  @media (max-width: 1165px) {
    width: 330px;
    min-height: 330px;
  }

  &__container {
    position: relative;
    padding: 36px 0;
    width: 100%;
    height: 100%;
    background: #7c7c7c;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    background-size: cover;
    background-position: center;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.25) 30%, rgba(0, 0, 0, 0.1) 70%, rgba(0, 0, 0, 0.75) 100%);
    }
  }

  &__title {
    z-index: 1;
    text-align: center;
    font-size: 32px;
    font-weight: 400;
    color: #fff;
    padding: 0 16px;
  }

  &__button {
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    text-decoration: none;
    color: #fff;
    font-weight: 500;

    span {
      line-height: 1;
    }
  }
}
</style>
