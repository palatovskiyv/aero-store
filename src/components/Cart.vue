<script setup lang="ts">
import { useCart } from '@/composables/useCart'
import { useEventBus } from '@/composables/useEventBus'
import { imgLink } from '@/utils/imgLink'
import { IconChevronRight } from '@tabler/icons-vue'
import { computed, onMounted, ref } from 'vue'

interface CartProduct {
  id: string
  title: string
  description: string
  price: string | number
  discount_price: string | number
  images?: Array<{ directus_files_id: string }>
  quantity: number
}

// Get cart items from local storage
const { getCart } = useCart()
const cartItems = ref<CartProduct[]>([])
const isLoading = ref(true)
const eventBus = useEventBus()

const totalPrice = computed(() => {
  return cartItems.value.reduce((total, item) => {
    const price = item.discount_price || item.price
    return total + Number(price) * item.quantity
  }, 0)
})

function formatPrice(price: number | string) {
  return `${new Intl.NumberFormat('ru-RU').format(Number(price))}₽`
}

// Load cart items with product details
async function loadCartItems() {
  isLoading.value = true

  try {
    // Get cart from localStorage
    const cartData = getCart()

    if (cartData.length === 0) {
      cartItems.value = []
      isLoading.value = false
      return
    }

    // Get the directus client
    const { $directus, $readItems } = useNuxtApp()

    // Create an array of product IDs to fetch
    const productIds = cartData.map(item => item.id)

    // Fetch product details
    const products = await $directus.request($readItems('products', {
      filter: {
        id: {
          _in: productIds,
        },
      },
      fields: ['*', 'images.*'],
    }))

    // Combine product details with quantities
    cartItems.value = products.map((product: any) => {
      const cartItem = cartData.find(item => item.id === product.id)
      return {
        ...product,
        quantity: cartItem?.quantity || 1,
      }
    })
  }
  catch (error) {
    console.error('Error loading cart:', error)
  }
  finally {
    isLoading.value = false
  }
}

// Update localStorage when cart changes
function updateLocalStorage() {
  const cartData = cartItems.value.map(item => ({
    id: item.id,
    quantity: item.quantity,
  }))

  localStorage.setItem('cart', JSON.stringify(cartData))
}

function removeFromCart(item: CartProduct) {
  const index = cartItems.value.findIndex(cartItem => cartItem.id === item.id)
  if (index > -1) {
    cartItems.value.splice(index, 1)
    updateLocalStorage()

    // Запускаем событие для обновления счетчика в шапке
    document.dispatchEvent(new CustomEvent('cart-updated'))

    // Отправляем событие удаления товара из корзины для обновления кнопок
    eventBus.emit('cart-product-removed', item.id)
  }
}

function clearCart() {
  cartItems.value = []
  localStorage.removeItem('cart')

  // Запускаем событие для обновления счетчика в шапке
  document.dispatchEvent(new CustomEvent('cart-updated'))
}

function increaseQuantity(item: CartProduct) {
  item.quantity++
  updateLocalStorage()

  // Запускаем событие для обновления счетчика в шапке
  document.dispatchEvent(new CustomEvent('cart-updated'))
}

function decreaseQuantity(item: CartProduct) {
  if (item.quantity > 1) {
    item.quantity--
    updateLocalStorage()

    // Запускаем событие для обновления счетчика в шапке
    document.dispatchEvent(new CustomEvent('cart-updated'))
  }
}

// Валидация введенного количества
function validateQuantity(item: CartProduct) {
  // Проверка на пустое значение или некорректное значение
  if (item.quantity === null || item.quantity === 0 || isNaN(Number(item.quantity))) {
    item.quantity = 1
    updateLocalStorage()
    return
  }

  // Убедимся, что количество всегда не меньше 1
  if (item.quantity < 1) {
    item.quantity = 1
    updateLocalStorage()
    return
  }

  // Округляем до целого числа
  item.quantity = Math.floor(Number(item.quantity))
  updateLocalStorage()

  // Запускаем событие для обновления счетчика в шапке
  document.dispatchEvent(new CustomEvent('cart-updated'))
}

// Load cart items on mount
onMounted(() => {
  loadCartItems()
})
</script>

<template>
  <div class="cart">
    <div class="cart__container">
      <h1 class="cart__title">
        КОРЗИНА
      </h1>

      <div v-if="isLoading" class="cart__loading">
        <div class="cart__loading-spinner" />
        <span>Загрузка корзины...</span>
      </div>

      <template v-else-if="cartItems.length > 0">
        <div class="cart__table">
          <div class="cart__table-header">
            <div class="cart__table-header-product">
              Товар
            </div>
            <div class="cart__table-header-quantity">
              Кол-во
            </div>
            <div class="cart__table-header-price">
              Цена
            </div>
          </div>
          <div class="cart__table-body">
            <div v-for="item in cartItems" :key="item.id" class="cart__item">
              <div class="cart__item-info">
                <div
                  class="cart__item-image"
                  :style="{
                    backgroundImage: item.images && item.images[0]
                      ? `url(${imgLink(item.images[0].directus_files_id)})`
                      : 'none',
                  }"
                  :aria-label="item.title"
                />
                <div class="cart__item-details">
                  <NuxtLink :to="`/product/${slugify(item.title)}-${item.id}`" class="cart__item-name-link">
                    <h2 class="cart__item-name">
                      {{ item.title }}
                    </h2>
                  </NuxtLink>
                  <button class="cart__item-remove" @click="removeFromCart(item)">
                    Удалить из корзины
                  </button>
                </div>
              </div>
              <div class="cart__item-quantity">
                <div class="quantity">
                  <button class="quantity-btn" @click="decreaseQuantity(item)">
                    −
                  </button>
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    class="quantity-value"
                    @change="validateQuantity(item)"
                    @blur="validateQuantity(item)"
                  >
                  <button class="quantity-btn" @click="increaseQuantity(item)">
                    +
                  </button>
                </div>
              </div>
              <div class="cart__item-price">
                <div>
                  <span v-if="item.discount_price">{{ formatPrice(item.discount_price) }}</span>
                  <span :class="{ crossed: item.discount_price }">{{ formatPrice(item.price) }}</span>
                </div>
                <button class="cart__item-remove-mobile" @click="removeFromCart(item)">
                  Удалить из корзины
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="cart__footer">
          <button class="cart__clear" @click="clearCart">
            Очистить корзину
          </button>
          <div class="cart__total">
            <span>Итоговая стоимость: {{ formatPrice(totalPrice) }}</span>
          </div>
          <NuxtLink to="/order" class="cart__checkout">
            <span>Оформить заказ</span>
            <span class="cart__checkout-arrow"><IconChevronRight color="#fff" /></span>
          </NuxtLink>
        </div>
      </template>

      <div v-else-if="!isLoading && cartItems.length === 0" class="cart__empty">
        <span class="cart__empty-title">
          Корзина пуста
        </span>
        <img src="/assets/icons/empty-cart.png" alt="Корзина пуста" class="cart__empty-image">
        <div class="cart__empty-text">
          Перейдите в раздел «Каталог», чтобы добавить необходимые товары
        </div>
        <NuxtLink to="/catalog" class="cart__empty-checkout">
          Перейти в каталог
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Variables
$color-black: #000;
$color-white: #fff;
$color-gray: #E5E5E5;
$color-dark-gray: #333;

$font-size-xl: 48px;
$font-size-base: 16px;
$font-size-sm: 14px;

$spacing-xs: 12px;
$spacing-sm: 15px;
$spacing-md: 20px;
$spacing-lg: 30px;
$spacing-xl: 40px;

.cart {
  min-height: 90vh;
  width: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: 52px;
  padding-top: 142px;

  @media (max-width: 1165px) {
    padding: 90px 15px 24px 15px;
  }

  &__container {
    min-height: 100%;
    max-width: 1166px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    gap: 30px;
  }

  &__loading {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;

    &-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: $color-black;
      animation: spin 1s ease-in-out infinite;
    }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  &__empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 30px;
  }

  &__empty-title {
    font-size: 24px;
    font-weight: 600;
    color: $color-black;
  }

  &__empty-checkout {
    height: 50px;
    max-width: 240px;
    background: $color-black;
    color: $color-white;
    border: none;
    border-radius: 50px;
    padding: 18px 36px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: $spacing-sm;
    transition: background-color 0.2s;
    text-decoration: none;

    @media (max-width: 1165px) {
      width: 100%;
    }

    &:hover {
      background-color: $color-dark-gray;
    }

    &-arrow {
      font-size: 24px;
      line-height: 1;
    }
  }

  &__empty-text {
    font-size: 16px;
    font-weight: 500;
    text-align: center;
  }

  &__empty-image {
    width: 100%;
    max-width: 160px;

    @media (max-width: 1165px) {
      max-width: 140px;
    }
  }

  &__title {
    font-size: 32px;
    font-weight: bold;

    @media (max-width: 1165px) {
      font-size: 24px;
    }
  }

  &__table {
    height: 100%;
    width: 100%;
    border-collapse: collapse;

    tbody {
      width: 100%;
    }

    th {
      text-align: left;
      padding: $spacing-sm 0;
      border-bottom: 1px solid #BBBBBB;
      font-weight: 500;
      color: $color-black;

      &:last-child {
        text-align: right;
      }
    }
  }

  &__table-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-bottom: 1px solid #BBBBBB;
    margin-bottom: 25px;
    padding-bottom: 15px;

    @media (max-width: 1165px) {
      margin-bottom: 15px;
    }
  }

  &__table-header-product {
    font-weight: 500;
    width: 50%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  &__table-header-quantity {
    font-weight: 500;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 25%;

    @media (max-width: 1165px) {
      display: none;
    }
  }

  &__table-header-price {
    font-weight: 500;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 25%;
  }

  &__table-body {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 20px;
  }

  &__item {
    width: 100%;
    max-height: 140px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-bottom: 1px solid #BBBBBB;
    padding-bottom: 25px;

    @media (max-width: 1165px) {
      max-height: 180px;
    }

    td {
      padding: $spacing-lg 0;
      vertical-align: middle;

      &:last-child {
        text-align: right;
      }
    }

    &-info {
      width: 50%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: $spacing-md;

      @media (max-width: 1165px) {
        width: 30%;
        flex-direction: column;
        align-items: flex-start;
      }
    }

    &-image {
      border-radius: 25px;
      width: 140px;
      height: 140px;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      background-color: #fff;

      @media (max-width: 1165px) {
        width: 100%;
        max-width: 110px;
        height: 85px;
        border-radius: 15px;
        order: 2;
      }
    }

    &-details {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: $spacing-xs;

      @media (max-width: 1165px) {
        height: unset;
        order: 1;
      }
    }

    &-name {
      font-size: $font-size-base;
      font-weight: 500;
      margin: 0;
      color: $color-black;
    }

    &-name-link {
      text-decoration: none;
      cursor: pointer;

      &:hover .cart__item-name {
        text-decoration: underline;
      }
    }

    &-remove {
      background: none;
      border: none;
      color: $color-black;
      text-decoration: underline;
      cursor: pointer;
      padding: 0;
      font-size: $font-size-sm;
      text-align: left;
      width: fit-content;

      @media (max-width: 1165px) {
        display: none;
      }
    }

    &-remove-mobile {
      background: none;
      border: none;
      color: $color-black;
      text-decoration: underline;
      cursor: pointer;
      padding: 0;
      font-size: 8px;
      text-align: left;
      width: fit-content;

      @media (min-width: 1166px) {
        display: none;
      }
    }

    &-quantity {
      width: 25%;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;

      @media (max-width: 1165px) {
        align-items: flex-end;
      }

      .quantity {
        display: flex;
        align-items: center;
        background: white;
        border-radius: 50px;
        overflow: hidden;
        height: 40px;
        min-width: 120px;

        @media (max-width: 1165px) {
          min-width: 100px;
        }
      }

      .quantity-btn {
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

      .quantity-value {
        padding: 0;
        width: 50px;
        color: #000;
        text-align: center;
        border: none;
        background: none;
        -moz-appearance: textfield;
        font-size: 16px;
        font-family: 'Montserrat', sans-serif;
        font-weight: 500;
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

    &-price {
      font-size: $font-size-base;
      font-weight: 500;
      white-space: nowrap;
      color: $color-black;
      width: 25%;
      display: flex;
      justify-content: flex-end;
      align-items: flex-start;

      .crossed {
        text-decoration: line-through;
        opacity: 0.75;
        margin-left: 8px;
        font-size: 14px;
      }

      @media (max-width: 1165px) {
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end;
      }
    }
  }

  &__footer {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;

    @media (max-width: 1165px) {
      flex-direction: column;
      gap: 10px;
    }

    .cart__clear {
      margin-right: auto;

      @media (max-width: 1165px) {
        width: 100%;
        margin-bottom: 10px;
      }
    }

    .cart__total {
      margin-left: auto;
      margin-right: 18px;

      @media (max-width: 1165px) {
        margin-left: 0;
        margin-right: 0;
        width: 100%;
      }
    }

    .cart__checkout {
      @media (max-width: 1165px) {
        width: 100%;
      }
    }
  }

  &__clear {
    height: 50px;
    min-width: 230px;
    background: #FFFFFF;
    color: $color-black;
    border: 1px solid $color-black;
    border-radius: 50px;
    padding: 18px 36px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.2s;
    text-decoration: none;

    @media (max-width: 1165px) {
      width: 100%;
      margin-bottom: 10px;
    }

    &:hover {
      background-color: $color-gray;
    }
  }

  &__total {
    border-radius: 50px;
    font-size: $font-size-base;
    background: #FFFFFF;
    color: $color-black;
    height: 50px;
    min-width: 332px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 1165px) {
      width: 100%;
    }
  }

  &__checkout {
    height: 50px;
    min-width: 230px;
    background: $color-black;
    color: $color-white;
    border: none;
    border-radius: 50px;
    padding: 18px 36px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: $spacing-sm;
    transition: background-color 0.2s;
    text-decoration: none;

    @media (max-width: 1165px) {
      width: 100%;
    }

    &:hover {
      background-color: $color-dark-gray;
    }

    &-arrow {
      font-size: 24px;
      line-height: 1;
    }
  }
}
</style>
