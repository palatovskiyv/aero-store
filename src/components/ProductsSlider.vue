<script setup>
import { useCart } from '@/composables/useCart'
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  title: String,
  buttonTitle: String,
  products: Array,
})

// Cart functionality
const { getCartItemsCount } = useCart()
const showCartNotification = ref(false)
const cartItemsCount = ref(0)

// Update cart count
function updateCartCount() {
  cartItemsCount.value = getCartItemsCount()
  showCartNotification.value = true

  // Hide notification after 3 seconds
  setTimeout(() => {
    showCartNotification.value = false
  }, 3000)
}

// Stop event propagation
function stopEvent(event) {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
}

// Элементы для доступа к DOM
const sliderWrapper = ref(null)
const currentSlide = ref(0)
const scrollPosition = ref(0)
const visibleSlides = ref(4) // По умолчанию в десктопе видно 4 слайда

// Вычисляем позицию и ширину индикатора прогресса
const progressPosition = computed(() => {
  const totalSlides = props.products.length
  if (totalSlides <= visibleSlides.value)
    return 0

  // Вычисляем процент прогресса на основе текущего слайда
  // Максимальный индекс слайда, учитывая видимые слайды
  const maxSlideIndex = totalSlides - visibleSlides.value

  // Вычисляем доступное пространство для перемещения индикатора (с учетом его ширины)
  const availableSpace = 100 - indicatorWidth.value

  // Вычисляем позицию индикатора на основе текущего слайда
  // Используем простое линейное отображение: currentSlide от 0 до maxSlideIndex -> position от 0 до availableSpace
  return (currentSlide.value / maxSlideIndex) * availableSpace
})

const indicatorWidth = computed(() => {
  const totalSlides = props.products.length
  if (totalSlides <= visibleSlides.value)
    return 100

  // Ширина индикатора пропорциональна видимой части слайдера
  return (visibleSlides.value / totalSlides) * 100
})

// Обработчик события скролла для обновления текущего слайда
function handleScroll() {
  if (!sliderWrapper.value)
    return

  const container = sliderWrapper.value
  const scrollLeft = container.scrollLeft
  const maxScroll = container.scrollWidth - container.clientWidth

  // Если максимальный скролл равен 0, выходим (нечего скроллить)
  if (maxScroll <= 0)
    return

  // Нормализуем позицию скролла (0 до 1)
  const scrollRatio = scrollLeft / maxScroll

  // Вычисляем максимальный индекс слайда
  const maxSlideIndex = props.products.length - visibleSlides.value

  // Устанавливаем текущий слайд на основе соотношения скролла
  // Используем Math.floor вместо Math.round для более плавного обновления позиции
  const newCurrentSlide = Math.floor(scrollRatio * maxSlideIndex + 0.1) // Добавляем небольшой порог для стабильности

  // Обновляем текущий слайд, если он изменился, с ограничением по диапазону
  if (newCurrentSlide !== currentSlide.value) {
    currentSlide.value = Math.max(0, Math.min(newCurrentSlide, maxSlideIndex))
  }

  scrollPosition.value = scrollLeft
}

// Определяем количество видимых слайдов в зависимости от ширины экрана
function updateVisibleSlides() {
  const width = window.innerWidth

  if (width <= 480) {
    visibleSlides.value = 1
  }
  else if (width <= 768) {
    visibleSlides.value = 2
  }
  else if (width <= 1024) {
    visibleSlides.value = 3
  }
  else {
    visibleSlides.value = 4
  }
}

// Методы управления слайдером
function scrollToSlide() {
  if (!sliderWrapper.value)
    return

  const slideElements = sliderWrapper.value.querySelectorAll('.products-slider__slide-wrapper')
  if (slideElements.length === 0)
    return

  const slideWidth = slideElements[0].offsetWidth + 16 // 16px - gap между слайдами
  sliderWrapper.value.scrollTo({
    left: currentSlide.value * slideWidth,
    behavior: 'smooth',
  })
}

function nextSlide() {
  if (currentSlide.value < props.products.length - visibleSlides.value) {
    currentSlide.value++
  }
  else {
    currentSlide.value = 0
  }
  scrollToSlide()
}

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
  else {
    currentSlide.value = props.products.length - visibleSlides.value
  }
  scrollToSlide()
}

function goToSlide(index) {
  currentSlide.value = index
  scrollToSlide()
}

// Инициализация при монтировании компонента
onMounted(() => {
  updateVisibleSlides()
  window.addEventListener('resize', updateVisibleSlides)
})
</script>

<template>
  <div class="products-slider">
    <div class="products-slider__header">
      <h2 class="products-slider__title">
        {{ title }}
      </h2>
      <NuxtLink to="/catalog" class="products-slider__all">
        {{ buttonTitle }} <span class="arrow">›</span>
      </NuxtLink>
    </div>
    <div class="products-slider__content">
      <div ref="sliderWrapper" class="products-slider__wrapper" @scroll="handleScroll">
        <div
          v-for="product in products"
          :key="product.id"
          class="products-slider__slide-wrapper"
        >
          <NuxtLink
            class="products-slider__slide"
            :to="{ name: 'product-id', params: { id: `${slugify(product.title)}-${product.id}` } }"
          >
            <CatalogItem
              :id="product.id"
              :title="product.title"
              :description="product.description"
              :price="product.price"
              :discount-price="product.discount_price"
              :images="product.images"
              button-text="Купить"
              @cart-updated="updateCartCount"
              @button-click="stopEvent"
            />
          </NuxtLink>
        </div>
      </div>
    </div>
    <div class="products-slider__footer">
      <div class="progress-container">
        <div class="progress-track">
          <div class="progress-indicator" :style="{ left: `${progressPosition}%`, width: `${indicatorWidth}%` }" />
        </div>
      </div>
      <div class="products-slider__pagination">
        <button class="pagination-arrow prev" @click="prevSlide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="#1D1D1F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <button class="pagination-arrow next" @click="nextSlide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5L16 12L9 19" stroke="#1D1D1F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.products-slider {
  width: 100%;
  max-width: 1166px;
  margin: 0 auto;
  padding: 50px 0;
  position: relative;

  @media (max-width: 1165px) {
    padding: 38px 15px 0 15px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  &__title {
    font-size: 30px;
    font-weight: 700;
    font-family: 'Montserrat', sans-serif;
    margin: 0;
    color: #000;
    text-transform: uppercase;
    letter-spacing: -0.5px;
  }

  &__all {
    display: flex;
    align-items: center;
    background-color: #EBEBEB;
    color: #000;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    padding: 8px 14px;
    border-radius: 100px;

    .arrow {
      margin-left: 6px;
      font-size: 18px;
    }

    &:hover {
      background-color: #DEDEDE;
    }
  }

  &__content {
    position: relative;
    margin-bottom: 24px;
  }

  &__wrapper {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */

    &::-webkit-scrollbar {
      display: none; /* Chrome, Safari and Opera */
    }
  }

  &__slide-wrapper {
    flex: 0 0 calc(25% - 12px);
    scroll-snap-align: start;
    position: relative;
    height: 500px;

    @media (max-width: 1024px) {
      flex: 0 0 calc(33.333% - 12px);
    }

    @media (max-width: 768px) {
      flex: 0 0 calc(50% - 12px);
    }

    @media (max-width: 480px) {
      flex: 0 0 calc(100% - 12px);
    }
  }

  &__slide {
    display: block;
    text-decoration: none;
    color: inherit;
    height: 100%;

    // Стили для CatalogItem внутри слайдера
    :deep(.catalog-item) {
      height: 500px;
      display: flex;
      flex-direction: column;

      // Увеличиваем высоту изображения
      .catalog-item__image {
        height: 300px;
      }
      
      @media (max-width: 480px) {
        height: 500px; // Фиксированная высота для мобильной версии
        
        .catalog-item__image {
          height: 300px;
        }
        
        .catalog-item__title,
        .catalog-item__description {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .catalog-item__description {
          height: auto;
          line-height: 12px;
        }
      }
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0;
  }

  &__pagination {
    display: flex;
    justify-content: center;
    gap: 16px;

    .pagination-arrow {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #EBEBEB;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #DEDEDE;
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.progress-container {
  flex: 1;
  margin-right: 20px;

  .progress-track {
    height: 6px;
    background-color: #E0E0E0;
    position: relative;
    width: 100%;
    border-radius: 5px;

    .progress-indicator {
      position: absolute;
      height: 6px;
      background-color: #000;
      top: 0;
      transition: left 1s ease, width 1s ease;
      border-radius: 5px;
    }
  }
}
</style>
