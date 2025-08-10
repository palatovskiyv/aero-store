<script setup>
import { useRouter } from '#app'
import { useCart } from '@/composables/useCart'
import { useCityFormatter } from '@/composables/useCityFormatter'
import { useNameFormatter } from '@/composables/useNameFormatter'
import { usePhoneMask } from '@/composables/usePhoneMask'
import { imgLink } from '@/utils/imgLink'
import { getAdSource, getUtmTags, saveUtmFromUrl } from '@/utils/cookies'
import { computed, onMounted, ref, watch } from 'vue'

// ===== REACTIVE STATE =====
const router = useRouter()
const isLoading = ref(false)
const isCartLoading = ref(true)
const cartProducts = ref([])

// Form data
const formData = ref({
  name: '',
  phone: '',
  email: '',
  city: '',
  notes: '',
})

// Form validation errors
const formErrors = ref({
  name: '',
  phone: '',
  email: '',
  city: '',
})

// ===== COMPOSABLES =====
const { getCart } = useCart()
const { phone, formattedPhone, handlePhoneInput, setPhone, clearPhone } = usePhoneMask()
const { name, formattedName, handleNameInput, setName, clearName } = useNameFormatter()
const { city, formattedCity, handleCityInput, setCity, clearCity } = useCityFormatter()

// ===== COMPUTED PROPERTIES =====
const totalPrice = computed(() => {
  if (!cartProducts.value.length)
    return '0'

  const total = cartProducts.value.reduce((sum, product) => {
    return sum + Number(product.discount_price || product.price) * product.quantity
  }, 0)

  return new Intl.NumberFormat('ru-RU').format(total)
})

// ===== WATCHERS =====
// Синхронизация значений из composables с formData
watch(phone, (value) => {
  formData.value.phone = value
})

watch(name, (value) => {
  formData.value.name = value
})

watch(city, (value) => {
  formData.value.city = value
})

// ===== UTILITY FUNCTIONS =====
function formatPrice(price) {
  return `${new Intl.NumberFormat('ru-RU').format(Number(price))}₽`
}

function clearCart() {
  localStorage.removeItem('cart')
  document.dispatchEvent(new CustomEvent('cart-updated'))
}

// ===== VALIDATION =====
function validateForm() {
  let isValid = true

  // Сброс ошибок
  formErrors.value = {
    name: '',
    phone: '',
    email: '',
    city: '',
  }

  // Валидация имени
  if (!formData.value.name.trim()) {
    formErrors.value.name = 'Введите ваше имя'
    isValid = false
  }

  // Валидация телефона
  if (!formData.value.phone.trim()) {
    formErrors.value.phone = 'Введите номер телефона'
    isValid = false
  }
  else if (formData.value.phone.length < 10) {
    formErrors.value.phone = 'Введите полный номер телефона'
    isValid = false
  }

  // Валидация email (необязательное поле)
  if (formData.value.email.trim() && !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(formData.value.email)) {
    formErrors.value.email = 'Введите корректный email'
    isValid = false
  }

  // Валидация города
  if (!formData.value.city.trim()) {
    formErrors.value.city = 'Введите город доставки'
    isValid = false
  }

  return isValid
}

// ===== API FUNCTIONS =====
async function loadCartProducts() {
  isCartLoading.value = true

  try {
    const cartData = getCart()

    if (cartData.length === 0) {
      router.push('/cart')
      return
    }

    const { $directus, $readItems } = useNuxtApp()
    const productIds = cartData.map(item => item.id)

    const products = await $directus.request($readItems('products', {
      filter: {
        id: {
          _in: productIds,
        },
      },
      fields: ['*', 'images.*'],
    }))

    cartProducts.value = products.map((product) => {
      const cartItem = cartData.find(item => item.id === product.id)
      return {
        ...product,
        quantity: cartItem?.quantity || 1,
      }
    })
  }
  catch (error) {
    console.error('Error loading cart products:', error)
    // Можно добавить уведомление пользователю об ошибке
  }
  finally {
    isCartLoading.value = false
  }
}

async function submitOrder() {
  if (!validateForm())
    return

  isLoading.value = true

  try {
    // Получаем данные о рекламном источнике
    const adSourceData = getAdSource()
    const utmTags = getUtmTags()
    console.log('UTM метки на фронте:', utmTags) // Логируем для отладки
    const orderData = {
      name: formData.value.name,
      phone: formData.value.phone,
      email: formData.value.email,
      city: formData.value.city,
      notes: formData.value.notes,
      items: cartProducts.value.map(product => ({
        productId: product.id,
        quantity: product.quantity,
      })),
      ad_source: adSourceData, // Добавляем данные о рекламном источнике
      utm: utmTags, // Добавляем utm-метки
    }

    const response = await $fetch('/api/orders/create', {
      method: 'POST',
      body: orderData,
    })

    if (response.success) {
      clearCart()
      router.push('/order/success')
    }
  }
  catch (error) {
    console.error('Error submitting order:', error)
    // Здесь можно добавить уведомление пользователю об ошибке
  }
  finally {
    isLoading.value = false
  }
}

// ===== LIFECYCLE =====
onMounted(() => {
  saveUtmFromUrl() // Сохраняем utm-метки из URL в cookies
  loadCartProducts()

  // Применяем форматирование к существующим значениям
  if (formData.value.phone)
    setPhone(formData.value.phone)
  if (formData.value.name)
    setName(formData.value.name)
  if (formData.value.city)
    setCity(formData.value.city)
})
</script>

<template>
  <div class="order-checkout">
    <h1 class="order-checkout__title">
      ОФОРМИТЬ ЗАКАЗ
    </h1>

    <div v-if="isCartLoading" class="order-checkout__loading">
      <div class="order-checkout__loading-spinner" />
      <span>Загрузка информации о заказе...</span>
    </div>

    <div v-else class="order-checkout__content">
      <div class="order-checkout__form">
        <h2 class="order-checkout__subtitle">
          Покупатель
        </h2>

        <div class="order-checkout__form-grid">
          <div class="form-group">
            <div class="form-control-wrapper">
              <input
                v-model="formattedName"
                type="text"
                class="form-control"
                placeholder="Имя *"
                :class="{ 'form-control--error': formErrors.name }"
                @input="handleNameInput"
              >
              <button
                v-if="formattedName"
                type="button"
                class="form-control-clear"
                @click="clearName"
              >
                ✕
              </button>
            </div>
            <div v-if="formErrors.name" class="form-error">
              {{ formErrors.name }}
            </div>
          </div>
          <div class="form-group">
            <div class="form-control-wrapper">
              <input
                v-model="formattedPhone"
                type="tel"
                class="form-control"
                placeholder="Телефон *"
                :class="{ 'form-control--error': formErrors.phone }"
                @input="handlePhoneInput"
              >
              <button
                v-if="formattedPhone"
                type="button"
                class="form-control-clear"
                @click="clearPhone"
              >
                ✕
              </button>
            </div>
            <div v-if="formErrors.phone" class="form-error">
              {{ formErrors.phone }}
            </div>
          </div>
          <div class="form-group">
            <div class="form-control-wrapper">
              <input
                v-model="formattedCity"
                type="text"
                class="form-control"
                placeholder="Город доставки *"
                :class="{ 'form-control--error': formErrors.city }"
                @input="handleCityInput"
              >
              <button
                v-if="formattedCity"
                type="button"
                class="form-control-clear"
                @click="clearCity"
              >
                ✕
              </button>
            </div>
            <div v-if="formErrors.city" class="form-error">
              {{ formErrors.city }}
            </div>
          </div>
          <div class="form-group">
            <div class="form-control-wrapper">
              <input
                v-model="formData.email"
                type="email"
                class="form-control"
                placeholder="Email (необязательно)"
                :class="{ 'form-control--error': formErrors.email }"
              >
              <button
                v-if="formData.email"
                type="button"
                class="form-control-clear"
                @click="formData.email = ''"
              >
                ✕
              </button>
            </div>
            <div v-if="formErrors.email" class="form-error">
              {{ formErrors.email }}
            </div>
          </div>
        </div>

        <div class="form-group">
          <textarea
            v-model="formData.notes"
            class="form-control form-control--textarea"
            placeholder="Комментарий к заказу"
          />
        </div>
      </div>

      <div class="order-checkout__summary">
        <h2 class="order-checkout__subtitle">
          Ваш заказ
        </h2>

        <div class="order-checkout__products">
          <div v-for="product in cartProducts" :key="product.id" class="order-checkout__product">
            <div
              class="order-checkout__product-image"
              :style="{
                backgroundImage: product.images && product.images[0]
                  ? `url(${imgLink(product.images[0].directus_files_id)})`
                  : 'none',
              }"
              :aria-label="product.title"
            />
            <div class="order-checkout__product-info">
              <div class="order-checkout__product-title">
                {{ product.title }}
              </div>
              <div class="order-checkout__product-meta">
                {{ product.quantity }} шт × {{ formatPrice(product.discount_price || product.price) }}
              </div>
            </div>
            <div class="order-checkout__product-total">
              {{ formatPrice(Number(product.discount_price || product.price) * product.quantity) }}
            </div>
          </div>
        </div>

        <div class="order-checkout__total">
          <div class="order-checkout__total-label">
            Итоговая сумма
          </div>
          <div class="order-checkout__total-price">
            {{ totalPrice }}₽
          </div>
        </div>

        <div class="order-checkout__actions">
          <NuxtLink class="btn btn--secondary" to="/cart">
            Вернуться в корзину
          </NuxtLink>
          <button
            class="btn btn--primary"
            :disabled="isLoading"
            @click="submitOrder"
          >
            {{ isLoading ? 'Обработка...' : 'Оформить заказ' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="!isCartLoading" class="order-checkout__notice">
      <h2 class="order-checkout__notice-title">
        ВАЖНО!
      </h2>
      <p class="order-checkout__notice-text">
        На данный момент наш сайт не поддерживает возможность онлайн оплаты, после оформления заявки с вами свяжется наш менеджер для дальнейшей оплаты товара и его доставки в ваш город или оформление самовывоза, спасибо за понимание!
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-checkout {
  min-height: 90vh;
  width: 100%;
  max-width: 1166px;
  margin: 0 auto;
  padding: 142px 0 52px 0;

  @media (max-width: 1165px) {
    padding: 90px 15px 30px 15px;
  }

  &__loading {
    width: 100%;
    min-height: 300px;
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
      border-top-color: #000;
      animation: spin 1s ease-in-out infinite;
    }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  &__title {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 29px;
    color: #000;

    @media (max-width: 1165px) {
      font-size: 24px;
    }
  }

  &__subtitle {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 15px;
    color: #000;
  }

  &__content {
    display: flex;
    gap: 30px;
    margin-bottom: 30px;

    @media (max-width: 1165px) {
      flex-direction: column;
    }
  }

  &__form {
    flex: 1;

    &-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 15px;
      margin-bottom: 15px;

      @media (max-width: 1165px) {
        grid-template-columns: 1fr;
      }
    }
  }

  &__summary {
    width: 35%;
    min-width: 300px;

    @media (max-width: 1165px) {
      width: 100%;
    }
  }

  &__products {
    margin-bottom: 20px;
    border: 1px solid #eee;
    border-radius: 15px;
    overflow-y: auto;
    max-height: 420px; /* Высота для 6 товаров (6 * 70px) */

    /* Стилизация полосы прокрутки */
    &::-webkit-scrollbar {
      width: 14px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    &::-webkit-scrollbar-button {
      display: none;
    }

    /* Для Firefox */
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
  }

  &__product {
    padding: 15px;
    min-height: 70px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:last-child {
      border-bottom: none;
    }

    &-image {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      margin-right: 15px;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      background-color: #fff;
      flex-shrink: 0;
    }

    &-info {
      flex: 1;
    }

    &-title {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 5px;
      color: #000;
    }

    &-meta {
      font-size: 12px;
      color: #666;
    }

    &-total {
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
      margin-left: 15px;
    }
  }

  &__total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    margin-bottom: 20px;
  }

  &__total-label {
    font-size: 16px;
    font-weight: 400;
  }

  &__total-price {
    font-size: 20px;
    font-weight: 700;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__notice {
    margin-top: 20px;
  }

  &__notice-title {
    font-size: 16px;
    font-weight: 700;
    margin: 0 0 10px;
    color: #000;
  }

  &__notice-text {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    color: #000;
    margin: 0;
  }
}

// Стили форм
.form-group {
  position: relative;
}

.form-control-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-control-clear {
  position: absolute;
  right: 15px;
  border: none;
  background: transparent;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.form-control-clear:hover {
  color: #f44336;
  background-color: rgba(0, 0, 0, 0.05);
}

.form-control {
  width: 100%;
  height: 50px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Montserrat', sans-serif;
  border: none;
  border-radius: 50px;
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &::placeholder {
    color: #000;
  }

  &:focus {
    outline: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  &--textarea {
    padding: 20px;
    height: 120px;
    border-radius: 25px;
    resize: none;
  }

  &--error {
    border: 1px solid #f44336;
  }
}

.form-error {
  color: #f44336;
  font-size: 12px;
  margin-top: 5px;
  padding-left: 20px;
}

// Стили кнопок
.btn {
  display: block;
  padding: 15px 20px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  text-decoration: none;

  &--primary {
    background-color: #000;
    color: #fff;
    border-radius: 50px;

    &:hover {
      background-color: #333;
    }

    &:disabled {
      background-color: #999;
      cursor: not-allowed;
    }
  }

  &--secondary {
    background-color: #fff;
    color: #000;
    border-radius: 50px;

    &:hover {
      background-color: #e6e6e6;
    }
  }
}
</style>
