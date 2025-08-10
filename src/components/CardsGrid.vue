<script setup lang="ts">
defineProps({
  items: Array<{
    id: string
    title: string
    preview: string
  }>,
})
</script>

<template>
  <div class="cards-grid">
    <div class="cards-grid__container">
      <h2 v-if="title" class="cards-grid__title">
        {{ title }}
      </h2>
      <div class="cards-grid__content">
        <CardsGridItem v-for="item in items" :id="item.id" :key="item.id" :image="item.preview" :title="item.title" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cards-grid {
    width: 100%;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 15px;

    &__container {
        max-width: 1166px;
        padding: 55px 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    &__content {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 28px;

        @media (max-width: 1200px) {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 740px) {
          grid-template-columns: 1fr;
        }

    }

    &__title {
        font-size: 32px;
        font-weight: 700;
        color: #000000;
        margin-bottom: 24px;
    }
}
</style>
