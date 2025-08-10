<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  images: string[]
}

const props = defineProps<Props>()
const selectedImageIndex = ref(0)

const selectedImage = computed(() => {
  return props.images[selectedImageIndex.value] || ''
})

function selectImage(index: number) {
  selectedImageIndex.value = index
}
</script>

<template>
  <div class="product-images">
    <div class="product-images__thumbnails">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="product-images__thumbnail-wrapper"
        :class="{ 'product-images__thumbnail-wrapper--active': index === selectedImageIndex }"
        @click="selectImage(index)"
      >
        <img
          :src="image"
          :alt="`Product thumbnail ${index + 1}`"
          class="product-images__thumbnail"
        >
      </div>
    </div>
    <div class="product-images__main">
      <img
        v-if="selectedImage"
        :src="selectedImage"
        alt="Product image"
        class="product-images__main-image"
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.product-images {
  display: flex;
  gap: 20px;

  &__thumbnails {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 500px;
    overflow-y: auto;
  }

  &__thumbnail-wrapper {
    width: 80px;
    height: 80px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.3s ease;

    &:hover {
      border-color: #999;
    }

    &--active {
      border-color: #000;
      border-width: 2px;
    }
  }

  &__thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__main {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    height: 500px;
  }

  &__main-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

@media (max-width: 1165px) {
  .product-images {
    flex-direction: column-reverse;

    &__thumbnails {
      flex-direction: row;
      max-height: none;
      overflow-x: auto;
      overflow-y: hidden;
    }

    &__main {
      height: 300px;
    }
  }
}
</style>
