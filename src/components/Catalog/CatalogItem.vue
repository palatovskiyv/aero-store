<script setup lang="ts">
import { imgLink } from '@/utils/imgLink'

interface Props {
  id: string
  title: string
  description: string
  price: string
  discountPrice: string
  images: Array<{ directus_files_id: string }>
  buttonText: string
}

defineProps<Props>()

// Событие клика по кнопке и обновления корзины
const emit = defineEmits(['cart-updated', 'button-click'])

// Handle cart updated event from the button
function handleCartUpdated(event: Event) {
  // Prevent the event from bubbling up to parent elements
  event.stopPropagation()
  // Notify the parent component that the cart has been updated
  emit('cart-updated')
  // Emit button click event to notify parent
  emit('button-click', event)
}

// Handle direct button click
function handleButtonClick(event: Event) {
  // Make sure click doesn't propagate
  event.stopPropagation()
  // Emit button click event
  emit('button-click', event)
}
</script>

<template>
  <div class="catalog-item">
    <div :style="{ backgroundImage: `url(${imgLink(images?.[0]?.directus_files_id)})` }" class="catalog-item__image" />
    <h2 class="catalog-item__title">
      {{ title }}
    </h2>
    <p class="catalog-item__description">
      {{ description }}
    </p>
    <p class="catalog-item__price">
      <span :class="{ 'catalog-item__price--crossed': discountPrice }"> {{ new Intl.NumberFormat('ru-RU').format(Number(price)) }} ₽ </span>
      <span v-if="discountPrice"> {{ new Intl.NumberFormat('ru-RU').format(Number(discountPrice)) }} ₽ </span>
    </p>
    <UiButton
      :id="id"
      class="catalog-item__buy"
      :text="buttonText"
      :product-info="{
        title,
        description,
        price,
        image: images?.[0]?.directus_files_id,
      }"
      @click="handleButtonClick"
      @cart-updated="handleCartUpdated"
    />
  </div>
</template>

<style lang="scss" scoped>
.catalog-item {
  height: 100%;
  width: 100%;
  color: var(--primary-color);
  padding: 24px 16px;
  border-radius: 24px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
  box-sizing: border-box;

  @media (max-width: 1165px) {
    height: auto;
    min-height: 460px;
  }

  @media (max-width: 768px) {
    padding: 16px 12px;
    gap: 12px;
    min-height: 430px;
  }

  @media (max-width: 480px) {
    padding: 12px 8px;
    gap: 8px;
    min-height: 400px;
  }

  &__image {
    height: 200px;
    width: 100%;
    position: relative;
    overflow: hidden;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    margin-bottom: 5px;
    box-sizing: border-box;

    @media (max-width: 768px) {
      height: 170px;
    }

    @media (max-width: 480px) {
      height: 150px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center;
    }
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
    line-height: 18px;
    height: 36px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;

    @media (max-width: 1165px) {
      font-size: 13px;
      line-height: 17px;
    }

    @media (max-width: 768px) {
      font-size: 12px;
      line-height: 16px;
      height: 32px;
    }
  }

  &__description {
    height: 105px;
    overflow: hidden;
    flex: 1;
    font-size: 14px;
    line-height: 18px;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    margin: 0 0 8px;

    @media (max-width: 1165px) {
      font-size: 12px;
      line-height: 16px;
      -webkit-line-clamp: 3;
      height: 95px;
    }

    @media (max-width: 768px) {
      font-size: 11px;
      line-height: 15px;
      -webkit-line-clamp: 5;
      height: 75px;
    }

    @media (max-width: 480px) {
      font-size: 10px;
      line-height: 14px;
      height: 70px;
    }
  }

  &__price {
    font-size: 16px;
    font-weight: 700;
    margin: 5px 0;

    &--crossed {
      text-decoration: line-through;
      opacity: 0.5;
      font-size: 14px;
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      font-size: 14px;
      margin: 3px 0;
    }
  }

  &__buy {
    flex-grow: 0;
    align-self: center;
    padding: 0 12px;
    font-size: 14px;
    margin-top: auto;

    @media (max-width: 1165px) {
      font-size: 13px;
    }

    @media (max-width: 768px) {
      font-size: 12px;
      padding: 0 8px;
    }
  }
}
</style>
