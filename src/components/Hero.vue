<script setup>
import { imgLink } from '@/utils/imgLink'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import UiButton from '~/components/ui/UiButton.vue'
import UiProductNamesSlider from '~/components/ui/UiProductNamesSlider.vue'

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
})
const currentSlide = ref(0)
const direction = ref('slide-right')
const router = useRouter()
const autoSlideInterval = ref(null)

// Переменные для отслеживания свайпа
const touchStartX = ref(0)
const touchEndX = ref(0)
const minSwipeDistance = 50 // Минимальное расстояние для определения свайпа
const isSwiping = ref(false)

// Product names for the slider
const productsList = computed(() => {
  return props.products.map(slide => ({
    title: slide.title,
    id: slide.id,
  }))
})

const currentImage = computed(() => props.products[currentSlide.value])

function nextSlide() {
  direction.value = 'slide-right' // Слайды движутся справа налево
  currentSlide.value = (currentSlide.value + 1) % props.products.length
}

function prevSlide() {
  direction.value = 'slide-left' // Слайды движутся слева направо
  currentSlide.value = (currentSlide.value - 1 + props.products.length) % props.products.length
}

// Запуск автоматической смены слайдов
function startAutoSlide() {
  stopAutoSlide() // Останавливаем существующий интервал, если есть
  autoSlideInterval.value = setInterval(() => {
    nextSlide()
  }, 5000) // 5 секунд
}

// Остановка автоматической смены слайдов
function stopAutoSlide() {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value)
    autoSlideInterval.value = null
  }
}

// Запускаем автослайдер при монтировании компонента
onMounted(() => {
  startAutoSlide()
})

// Очищаем интервал при размонтировании компонента
onUnmounted(() => {
  stopAutoSlide()
})

// Обработчики событий свайпа
function handleTouchStart(event) {
  touchStartX.value = event.touches[0].clientX
  isSwiping.value = true
  stopAutoSlide() // Останавливаем авто-смену при свайпе
}

function handleTouchMove(event) {
  if (!isSwiping.value)
    return
  touchEndX.value = event.touches[0].clientX
}

function handleTouchEnd() {
  if (!isSwiping.value)
    return

  const swipeDistance = touchEndX.value - touchStartX.value

  // Если было достаточное движение влево, показываем следующий слайд
  if (swipeDistance < -minSwipeDistance) {
    nextSlide()
  }
  // Если было достаточное движение вправо, показываем предыдущий слайд
  else if (swipeDistance > minSwipeDistance) {
    prevSlide()
  }

  // Сбрасываем состояние свайпа
  isSwiping.value = false
  startAutoSlide() // Восстанавливаем авто-смену после свайпа
}
</script>

<template>
  <section class="hero">
    <div class="hero__container">
      <div class="hero__content">
        <transition name="fade-title" mode="out-in">
          <h3 :key="currentImage.id" class="hero__title">
            {{ currentImage.title }}
          </h3>
        </transition>
        <transition name="fade-button">
          <UiButton
            text="Купить"
            bg-color="#1C1C1C"
            color="#fff"
            width="138px"
            @click="router.push(`/product/${currentImage.product.id}`)"
          >
            <template #icon>
              <IconChevronRight />
            </template>
          </UiButton>
        </transition>
      </div>

      <div class="hero__slider">
        <div
          class="hero__slider-images"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <transition-group
            :name="direction"
            tag="div"
            class="hero__slider-wrapper"
          >
            <picture
              v-for="(product, index) in props.products"
              v-show="currentSlide === index"
              :key="product.id"
            >
              <source
                media="(orientation: portrait) and (max-width: 1165px)"
                :srcset="imgLink(product.image_mobile || product.image)"
              >
              <img
                :src="imgLink(product.image)"
                :alt="product.title"
                class="hero__slider-image"
              >
            </picture>
          </transition-group>
        </div>

        <div class="hero__slider-info">
          <!-- Product Names Slider - только для десктопа -->
          <div class="hero__product-slider">
            <UiProductNamesSlider
              v-model="currentSlide"
              :products="productsList"
              @update:model-value="stopAutoSlide(); startAutoSlide()"
            />
          </div>
        </div>

        <!-- Mobile line indicators -->
        <div class="hero__mobile-indicators">
          <div
            v-for="(image, index) in props.products"
            :key="`indicator-${index}`"
            class="hero__mobile-indicator"
            :class="{ 'hero__mobile-indicator--active': index === currentSlide }"
            @click="currentSlide = index; stopAutoSlide(); startAutoSlide()"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hero {
  width: 100%;
  height: 100dvh;
  background-color: #000;
  color: #fff;
  position: relative;
  overflow: hidden;

  @media (max-width: 1165px) {
    height: 85dvh;
  }

  &__container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  &__content {
    position: absolute;
    top: 15%;
    left: 0;
    right: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  &__title {
    font-size: 64px;
    font-weight: 400;
    margin-bottom: 30px;
    letter-spacing: 2px;
    text-transform: uppercase;

    @media (max-width: 1165px) {
      font-size: 32px;
      margin-bottom: 20px;
    }
  }

  &__button {
    background-color: rgba(70, 70, 70, 0.6);
    color: white;
    border: none;
    border-radius: 50px;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
    backdrop-filter: blur(5px);

    &:hover {
      background-color: rgba(90, 90, 90, 0.7);
    }
  }

  &__slider {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 1165px) {
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100px;
        z-index: 3;
      }
    }
  }

  &__slider-navigation {
    display: none; /* Скрываем навигационные стрелки в десктопной версии */
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    z-index: 5;

    @media (max-width: 1165px) {
      display: none;
    }
  }

  &__slider-images {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    touch-action: pan-y; /* Разрешаем вертикальную прокрутку, но обрабатываем горизонтальные жесты */
    position: relative;
  }

  &__slider-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }

  &__slider-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &__slider-info {
    position: absolute;
    width: 100%;
    bottom: 30px;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 5;

    @media (max-width: 1165px) {
      padding: 0 20px;
      bottom: 80px;
      display: none; /* Скрываем слайдер названий в мобильной версии */
    }
  }

  &__product-slider {
    width: 1166px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__slider-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    padding-left: 15px;
    margin-top: 4px;
  }

  /* Заменяем точки на индикаторы-полоски */
  &__mobile-indicators {
    display: none;
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    justify-content: center;
    gap: 10px;
    z-index: 5;

    @media (max-width: 1165px) {
      display: flex;
    }
  }

  &__mobile-indicator {
    width: 25px;
    height: 3px;
    background-color: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: background-color 0.3s ease;

    &--active {
      background-color: #fff;
    }
  }
}

// Анимации для смены изображений (вправо/влево)
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.slide-left-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

// Анимация для появления заголовка
.fade-title-enter-active {
  transition: all 0.3s ease 0.3s;
}
.fade-title-leave-active {
  transition: all 0.3s ease;
}
.fade-title-enter-from,
.fade-title-leave-to {
  opacity: 0;
}

// Анимация для появления кнопки
.fade-button-enter-active {
  transition: all 1s ease 0.8s;
  transition-delay: 0.3s;
}
.fade-button-leave-active {
  transition: all 0.3s ease;
}
.fade-button-enter-from {
  opacity: 0;
}

@media (max-width: 1165px) {
  .hero {
    display: flex;
    flex-direction: column;
    position: relative;

    &__slider-wrapper {
      &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 180px;
        background: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0) 100%);
        z-index: 4;
      }
    }

    &__slider-image {
      object-fit: cover;
    }

    &__slider-info {
      padding: 0 20px;
      bottom: 80px;
    }

    &__title {
      margin-top: 20px;
    }

    &__container {
      display: flex;
      flex-direction: column;
    }

    &__mobile-indicators {
      bottom: 20px;
    }
  }
}
</style>
