<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue'])
const currentIndex = ref(props.modelValue)

function selectProduct(index) {
  currentIndex.value = index
  emit('update:modelValue', index)
}

watch(() => props.modelValue, (newVal) => {
  currentIndex.value = newVal
})
</script>

<template>
  <div class="product-slider">
    <div
      class="product-slider__items"
      :style="{ transform: `translateY(${-currentIndex * 24}px)` }"
    >
      <div
        v-for="(product, index) in products"
        :key="index"
        class="product-slider__item"
        :class="{ 'product-slider__item--active': index === currentIndex }"
        @click="selectProduct(index)"
      >
        <span v-if="index === currentIndex" class="product-slider__marker">|</span>
        <div class="product-slider__text" />{{ product.title }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.product-slider {
  position: relative;
  height: 72px;
  overflow: hidden;
  width: fit-content;
  max-width: 200px;

  &__items {
    position: relative;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease;
    padding: 24px 0;
  }

  &__item {
    height: 24px;
    line-height: 24px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    cursor: pointer;
    transition: color 0.3s ease, opacity 0.3s ease;
    opacity: 0.5;
    display: flex;
    align-items: center;

    &--active {
      color: #fff;
      opacity: 1;
    }

    &:hover:not(&--active) {
      opacity: 0.8;
    }
  }

  &__marker {
    width: 1px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 300;
    margin-right: 0;
    position: relative;
    top: -1px;
    font-size: 12px;
  }

  &__text {
    padding-left: 6px;
  }

  @media (max-width: 1165px) {
    height: 60px;

    &__item {
      font-size: 12px;
      height: 20px;
      line-height: 20px;
    }
  }
}
</style>
