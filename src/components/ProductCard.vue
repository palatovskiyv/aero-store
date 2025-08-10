<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '~/composables/useCart'
import { useEventBus } from '~/composables/useEventBus'
import { imgLink } from '~/utils/imgLink'
import BreadCrumbs from './BreadCrumbs.vue'

interface Product {
  id: string
  title: string
  type: string
  model: {
    type: { title: string, id: number }
    title: string
    id: number
  }
  description: string
  price: number
  discount_price?: number
  images: Array<{ id: string, directus_files_id: string }>
  specifications?: Array<{ specification: { title: string }, value: string }>
  specification?: string
  full_description?: string
  complectation?: string
}

const props = defineProps<{ product: Product }>()

const quantity = ref(1)
const currentImageIndex = ref(0)
const thumbnailStartIndex = ref(0)
const isAddedToCart = ref(false)
const buttonText = ref('В корзину')

const router = useRouter()
const eventBus = useEventBus()
const { addToCart: addItemToCart, getCart } = useCart()

// Вычисляемое свойство для отображения только 4 миниатюр
const visibleThumbnails = computed(() => {
  if (!props.product?.images || !props.product.images.length)
    return []
  return props.product.images.slice(thumbnailStartIndex.value, thumbnailStartIndex.value + 4)
})

// Проверка наличия миниатюр для навигации
const hasPrevThumbnails = computed(() => thumbnailStartIndex.value > 0)
const hasNextThumbnails = computed(() => {
  return props.product?.images && (thumbnailStartIndex.value + 4 < props.product.images.length)
})

// Следим за изменением активного изображения и автоматически перемещаем слайдер
watch(currentImageIndex, (newIndex) => {
  // Проверяем, что текущий индекс не в видимой области
  if (newIndex < thumbnailStartIndex.value) {
    // Если индекс меньше начального индекса, устанавливаем его в начало
    thumbnailStartIndex.value = newIndex
  }
  else if (newIndex >= thumbnailStartIndex.value + 4) {
    // Если индекс больше или равен конечному индексу, смещаем до видимости
    thumbnailStartIndex.value = newIndex - 3
  }
})

// Проверяем есть ли товар в корзине при загрузке
onMounted(() => {
  if (props.product?.id) {
    const cart = getCart()
    const isInCart = cart.some(item => item.id === props.product.id)
    if (isInCart) {
      isAddedToCart.value = true
      buttonText.value = 'В корзине'
    }
  }

  // Слушаем событие удаления товара из корзины
  eventBus.on('cart-product-removed', (productId: string) => {
    if (props.product?.id === productId) {
      isAddedToCart.value = false
      buttonText.value = 'Купить'
    }
  })
})

// Очищаем слушатели при удалении компонента
onUnmounted(() => {
  eventBus.off('cart-product-removed')
})

function addToCart(productId: string) {
  // Если товар уже в корзине, переходим в корзину
  if (isAddedToCart.value) {
    router.push('/cart')
    return
  }

  try {
    const success = addItemToCart(productId, quantity.value)

    if (success) {
      // Обновляем текст кнопки
      isAddedToCart.value = true
      buttonText.value = 'В корзине'

      // Отправляем событие для отображения всплывающего окна
      if (props.product) {
        eventBus.emit('product-added-to-cart', {
          id: props.product.id,
          title: props.product.title,
          price: props.product.price,
          image: props.product.images?.[0]?.directus_files_id,
          quantity: quantity.value,
        })
      }

      // Отправляем событие для обновления счетчика в шапке
      document.dispatchEvent(new CustomEvent('cart-updated'))
    }
  }
  catch (error) {
    console.error('Error adding to cart:', error)
  }
}

function decrementQuantity() {
  if (quantity.value > 1) {
    quantity.value--
    // Если товар уже в корзине, обновляем количество
    if (isAddedToCart.value && props.product?.id) {
      updateCartItemQuantity(props.product.id, quantity.value)
    }
  }
}

function incrementQuantity() {
  quantity.value++
  // Если товар уже в корзине, обновляем количество
  if (isAddedToCart.value && props.product?.id) {
    updateCartItemQuantity(props.product.id, quantity.value)
  }
}

// Функция для обновления количества товара в корзине
function updateCartItemQuantity(productId: string, newQuantity: number) {
  try {
    // Получаем текущую корзину
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')

    // Находим товар в корзине
    const cartItem = cart.find((item: any) => item.id === productId)

    if (cartItem) {
      // Обновляем количество
      cartItem.quantity = newQuantity

      // Сохраняем обновленную корзину
      localStorage.setItem('cart', JSON.stringify(cart))

      // Отправляем событие для отображения всплывающего окна с обновленным количеством
      if (props.product) {
        eventBus.emit('product-added-to-cart', {
          id: props.product.id,
          title: props.product.title,
          price: props.product.price,
          discount_price: props.product.discount_price,
          image: props.product.images?.[0]?.directus_files_id,
          quantity: newQuantity,
        })
      }

      // Отправляем событие для обновления счетчика в шапке
      document.dispatchEvent(new CustomEvent('cart-updated'))
    }
  }
  catch (error) {
    console.error('Error updating cart item quantity:', error)
  }
}

function showImage(index: number) {
  currentImageIndex.value = index
}

function nextImage() {
  if (props.product.images && props.product.images.length > 0) {
    currentImageIndex.value = (currentImageIndex.value + 1) % props.product.images.length
  }
}

function prevImage() {
  if (props.product.images && props.product.images.length > 0) {
    currentImageIndex.value = (currentImageIndex.value - 1 + props.product.images.length) % props.product.images.length
  }
}

// Функции навигации для миниатюр
function prevThumbnails() {
  if (thumbnailStartIndex.value > 0) {
    thumbnailStartIndex.value -= 1
  }
}

function nextThumbnails() {
  if (props.product.images && thumbnailStartIndex.value + 4 < props.product.images.length) {
    thumbnailStartIndex.value += 1
  }
}

function validateQuantity() {
  // Проверка на пустое значение
  if (quantity.value === null || quantity.value === 0 || Number.isNaN(quantity.value)) {
    quantity.value = 1
    return
  }

  // Убедимся, что количество всегда не меньше 1
  if (quantity.value < 1) {
    quantity.value = 1
  }
  // Округляем до целого числа
  quantity.value = Math.floor(quantity.value)

  // Если товар уже в корзине, обновляем количество
  if (isAddedToCart.value && props.product?.id) {
    updateCartItemQuantity(props.product.id, quantity.value)
  }
}

const breadcrumbItems = computed(() => [
  { text: 'Каталог', to: '/catalog' },
  { text: props.product.model.type.title, to: `/type/${slugify(props.product.model.type.title)}-${props.product.model.type.id}` },
  { text: props.product.model.title, to: `/model/${slugify(props.product.model.title)}-${props.product.model.id}` },
  // { text: props.product.title, to: `/product/${props.product.id}` },
])

useSeoMeta({
  title: props.product.title,
  description: props.product.description,
})
</script>

<template>
  <div class="product-card">
    <div class="product-card__container">
      <BreadCrumbs class="product-card__breadcrumbs" :items="breadcrumbItems" />
      <div class="product-card__top">
        <div class="product-card__gallery">
          <div class="product-card__thumbnails-wrapper">
            <button
              class="thumbnails-nav prev"
              aria-label="Предыдущие миниатюры"
              :disabled="!hasPrevThumbnails"
              @click="prevThumbnails"
            >
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5L5 1L1 5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>

            <div class="product-card__thumbnails">
              <div
                v-for="(image, idx) in visibleThumbnails"
                :key="image.id"
                class="thumbnail"
                :class="{ active: currentImageIndex === idx + thumbnailStartIndex }"
                @click="showImage(idx + thumbnailStartIndex)"
              >
                <NuxtImg :src="imgLink(image.directus_files_id)" :alt="product.title" />
              </div>
            </div>

            <button
              class="thumbnails-nav next"
              aria-label="Следующие миниатюры"
              :disabled="!hasNextThumbnails"
              @click="nextThumbnails"
            >
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <div class="product-card__main-image">
            <div class="image-container" @click="nextImage">
              <NuxtImg :src="imgLink(product?.images[currentImageIndex]?.directus_files_id)" alt="Product main" />
            </div>
            <div class="product-card__nav">
              <button class="nav-button prev" aria-label="Предыдущее изображение" @click.stop="prevImage">
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 1L1 5L5 9" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <button class="nav-button next" aria-label="Следующее изображение" @click.stop="nextImage">
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L1 9" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="product-card__details">
          <div class="product-card__details-top">
            <h1 class="product-card__title">
              {{ product.title }}
            </h1>
            <div class="product-card__info">
              <div v-if="product.model && product.model.type && product.model.type.title" class="info-row">
                <div class="info-label">
                  Тип товара
                </div>
                <span class="info-dots" />
                <div class="info-value">
                  {{ product.model.type.title }}
                </div>
              </div>
              <div v-if="product.model && product.model.title" class="info-row">
                <div class="info-label">
                  Модель
                </div>
                <span class="info-dots" />
                <div class="info-value">
                  {{ product.model.title }}
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">
                  Краткое описание:
                </div>
              </div>
            </div>
            <p class="product-card__description">
              {{ product.description }}
            </p>
          </div>

          <div class="product-card__details-bottom">
            <div class="product-card__price">
              <div class="price-label">
                Стоимость:
              </div>
              <div
                v-if="product.discount_price"
                class="price-value"
              >
                {{ new Intl.NumberFormat('ru-RU').format(product.discount_price * quantity) }} ₽
              </div>
              <div
                class="price-value"
                :class="{ 'price-value--crossed': product.discount_price }"
              >
                {{ new Intl.NumberFormat('ru-RU').format(product.price * quantity) }} ₽
              </div>
            </div>

            <div class="product-card__actions">
              <div class="quantity-controls">
                <button class="qty-btn minus" @click="decrementQuantity">
                  -
                </button>
                <input
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  class="qty-value"
                  @change="validateQuantity"
                  @blur="validateQuantity"
                >
                <button class="qty-btn plus" @click="incrementQuantity">
                  +
                </button>
              </div>
              <button class="cart-button" :class="{ added: isAddedToCart }" @click="addToCart(product.id)">
                {{ buttonText }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="product-card__accordion">
        <div v-if="product.specification" class="accordion-item">
          <input id="accordion-1" type="checkbox" class="accordion-checkbox">
          <label for="accordion-1" class="accordion-button">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" class="accordion-icon">
              <path d="M1 1L5 5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Характеристики</span>
          </label>
          <div
            class="accordion-content"
            v-html="product.specification"
          />
        </div>

        <div v-if="product.full_description" class="accordion-item">
          <input id="accordion-2" type="checkbox" class="accordion-checkbox">
          <label for="accordion-2" class="accordion-button">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" class="accordion-icon">
              <path d="M1 1L5 5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Описание</span>
          </label>
          <div
            class="accordion-content"
            v-html="product.full_description"
          />
        </div>

        <div v-if="product.complectation" class="accordion-item">
          <input id="accordion-3" type="checkbox" class="accordion-checkbox">
          <label for="accordion-3" class="accordion-button">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Комплектация</span>
          </label>
          <div
            class="accordion-content"
            v-html="product.complectation"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.product-card {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 0 15px;

  &__container {
    height: 100%;
    max-width: 1166px;
    width: 100%;
    padding-bottom: 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 24px;

    @media (max-width: 1165px) {
      gap: 15px;
      padding-bottom: 20px;
    }
  }

  &__top {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    @media (max-width: 1165px) {
      flex-direction: column;
    }
  }

  &__gallery {
    width: 45%;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;

    @media (max-width: 1165px) {
      flex-direction: column;
      width: 100%;
      align-items: center;
      margin-bottom: 18px;
    }
  }

  &__thumbnails-wrapper {
    height: 100%;
    width: 90px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    position: relative;

    @media (max-width: 1165px) {
      width: 100%;
      flex-direction: row;
      justify-content: center;
      margin-bottom: 12px;
      gap: 8px;
    }

    .thumbnails-nav {
      width: 24px;
      height: 24px;
      background: #F5F5F5;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s ease;
      z-index: 2;

      &:hover {
        background: #E0E0E0;
      }

      &:disabled {
        opacity: 0.4;
        cursor: default;

        &:hover {
          background: #F5F5F5;
        }
      }

      @media (max-width: 1165px) {
        // Поворачиваем стрелки для горизонтального слайдера на мобильных устройствах
        &.prev svg {
          transform: rotate(-90deg);
        }
        &.next svg {
          transform: rotate(-90deg);
        }
      }
    }
  }

  &__thumbnails {
    width: 90px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 396px; // Высота 4 миниатюр (90px * 4 + 12px * 3)
    overflow: hidden;
    transition: all 0.3s ease; // Добавляем анимацию при смещении

    @media (max-width: 1165px) {
      width: auto;
      max-width: 396px; // Ширина для 4 миниатюр (90px * 4 + 12px * 3)
      flex-direction: row;
      max-height: unset;
      gap: 8px;
    }

    .thumbnail {
      width: 90px;
      height: 90px;
      flex-shrink: 0;
      border-radius: 15px;
      overflow: hidden;
      border: 1px solid #eee;
      cursor: pointer;
      transition: all 0.2s ease;

      @media (max-width: 768px) {
        width: 70px;
        height: 70px;
      }

      &.active {
        border: 2px solid #000;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  &__main-image {
    flex: 1;
    position: relative;
    border-radius: 25px;
    overflow: hidden;
    background: #fff;
    height: 480px;
    display: flex;
    align-items: center;
    justify-content: center;

    .image-container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    img {
      max-width: 70%;
      max-height: 90%;
      object-fit: contain;
    }

    .product-card__nav {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      transform: translateY(-50%);
      display: flex;
      justify-content: space-between;
      padding: 0 16px;

      .nav-button {
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.7);
        border: none;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.9);
        }
      }
    }

    @media (max-width: 1165px) {
      min-height: 360px;
      width: 100%;
      max-width: 380px;
      margin-bottom: 0;
    }

    @media (max-width: 768px) {
      height: 300px;
    }
  }

  &__details {
    padding: 2rem;
    border-radius: 25px;
    background: #000;
    width: 52%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;

    @media (max-width: 1165px) {
      width: 100%;
      padding: 2rem;
    }
  }

  &__details-top {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 18px;
  }

  &__details-bottom {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 18px;
  }

  &__title {
    color: #fff;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
  }

  &__info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .info-row {
      display: flex;
      align-items: flex-end;
      line-height: 0.9;

      .info-label {
        font-size: 14px;
        color: #fff;
        flex-shrink: 0;
        position: relative;
      }

      .info-dots {
        flex: 1;
        border-bottom: 1px dotted #ccc;
        margin: 0 10px;
      }

      .info-value {
        font-size: 14px;
        color: #fff;
      }
    }
  }

  &__description {
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
    color: #fff;
    font-weight: 200;
  }

  &__price {
    display: flex;
    align-items: center;
    margin-top: 8px;

    .price-label {
      font-weight: 500;
      font-size: 14px;
      margin-right: 8px;
      color: #fff;
    }

    .price-value {
      font-size: 14px;
      font-weight: 200;
      color: #fff;
      margin-right: 8px;

      &--crossed {
        opacity: 0.75;
        text-decoration: line-through;
      }
    }
  }

  &__actions {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 24px;
    margin-top: 8px;

    @media (max-width: 1165px) {
      width: 100%;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      background: white;
      border-radius: 50px;
      overflow: hidden;
      height: 40px;
      min-width: 120px;

      .qty-btn {
        font-size: 22px;
        width: 32px;
        height: 100%;
        background: white;
        border: unset;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
      }

      .qty-value {
        font-family: 'Montserrat', sans-serif;
        padding: 0;
        width: 50px;
        color: #000;
        text-align: center;
        border: none;
        background: none;
        -moz-appearance: textfield;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        flex: 1;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        &:focus {
          outline: none;
        }

        @media (max-width: 1165px) {
          width: 40px;
          padding: 0;
        }
      }
    }

    .cart-button {
      width: 100%;
      padding: 10px;
      background: white;
      border: 1px solid black;
      border-radius: 24px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;

      &.added {
        background-color: #28a745;
        border-color: #28a745;
        color: white;
      }
    }
  }

  &__accordion {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;

    .accordion-item {
      margin-bottom: 2px;
      position: relative;
    }

    .accordion-checkbox {
      position: absolute;
      opacity: 0;
      z-index: -1;
    }

    .accordion-button {
      width: 100%;
      padding: 16px 22px;
      background: black;
      color: white;
      border: none;
      border-radius: 50px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 21px;
      text-align: left;
      cursor: pointer;

      span {
        font-size: 16px;
      }

      svg {
        transition: transform 0.3s ease;
      }
    }

    .accordion-content {
      padding: 0 48px;
      max-height: 0;
      overflow-x: auto;
      transition: max-height 0.5s cubic-bezier(0, 1, 0, 1), padding 0.3s ease;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;

      @media (max-width: 768px) {
        padding: 0 24px;
      }
    }

    .accordion-checkbox:checked ~ .accordion-button svg {
      transform: rotate(180deg);
    }

    .accordion-checkbox:checked ~ .accordion-content {
      max-height: 100000px;
      padding: 24px 48px;
      transition: max-height 0.5s cubic-bezier(0.5, 0, 1, 0), padding 0.3s ease;

      @media (max-width: 768px) {
        padding: 24px 24px;
      }
    }

    .product-specs {
      padding: 10px 0;

      &__grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px 30px;

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
        }
      }

      .specs-row {
        display: flex;
        align-items: baseline;
        padding: 8px 0;
        font-size: 14px;
        line-height: 1.5;

        .specs-label {
          font-weight: 500;
          color: #666;
          position: relative;
          display: flex;
          align-items: center;

        }

        .specs-line {
          flex: 1;
          border-bottom: 1px dotted #ccc;
          margin: 0 10px;
        }

        .specs-value {
          display: block;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.accordion-content {
  img {
    max-width: 100%;
  }
}

.accordion-content {
  table {
    width: 100%;
  }
}
</style>
