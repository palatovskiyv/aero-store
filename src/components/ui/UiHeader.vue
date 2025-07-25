<script setup>
import { NuxtLink } from '#components'
import { useCart } from '@/composables/useCart'
import { useEventBus } from '@/composables/useEventBus'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import CartPopup from './CartPopup.vue'
import { imgLink } from '@/utils/imgLink'

const isMenuOpen = ref(false)
const isSearchOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const { getCartItemsCount, getCart } = useCart()
const eventBus = useEventBus()
// Инициализируем cartItemsCount сразу при создании компонента
const cartItemsCount = ref(getCartItemsCount())

// Функция для преобразования заголовка в URL-совместимую строку
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Заменяем пробелы на дефисы
    .replace(/[^\w\-]+/g, '') // Удаляем все не-буквенно-цифровые символы
    .replace(/\-\-+/g, '-')   // Заменяем множественные дефисы на один
}

// Обновляем количество товаров в корзине
function updateCartCount() {
  cartItemsCount.value = getCartItemsCount()
}

// Следим за изменением состояния меню
watch(isMenuOpen, (newValue) => {
  if (newValue) {
    // Блокируем скролл при открытии меню
    document.body.style.overflow = 'hidden'
  }
  else {
    // Возвращаем скролл при закрытии меню
    document.body.style.overflow = ''
  }
})

// Обработчик наведения мыши на иконку корзины
function onCartMouseEnter() {
  // Получаем текущие товары в корзине
  const cartItems = getCart()
  // Передаем данные о товарах в CartPopup через шину событий
  eventBus.emit('cart-icon-mouseenter', cartItems)
}

// Обработчик ухода мыши с иконки корзины
function onCartMouseLeave() {
  // Оповещаем CartPopup о событии через шину событий
  eventBus.emit('cart-icon-mouseleave')
}

// Функция для открытия/закрытия окна поиска
function toggleSearch() {
  console.log('toggleSearch вызван, isSearchOpen до:', isSearchOpen.value)
  isSearchOpen.value = !isSearchOpen.value
  console.log('isSearchOpen после:', isSearchOpen.value)

  if (isSearchOpen.value) {
    // Сбрасываем поисковый запрос при открытии
    searchQuery.value = ''
    searchResults.value = []

    // Загружаем новинки при открытии окна поиска
    loadNewProducts()
    
    // Блокируем скролл страницы при открытии поиска
    document.body.style.overflow = 'hidden'
  } else {
    // Разблокируем скролл при закрытии поиска
    document.body.style.overflow = ''
  }
}

// Функция для загрузки новых товаров (новинки)
async function loadNewProducts() {
  try {
    const { $directus, $readItem } = useNuxtApp()
    // Получаем данные из config, как это сделано на главной странице
    const response = await $directus.request($readItem('config', 1, {
      fields: ['novelty.*', 'novelty.images.*'],
    }))
    // Ограничиваем количество новинок до 7
    searchResults.value = response.novelty.slice(0, 7)
  }
  catch (error) {
    console.error('Ошибка при загрузке новинок:', error)
  }
}

// Функция для поиска товаров при вводе текста
async function searchProducts() {
  if (!searchQuery.value.trim()) {
    // Если строка поиска пуста, показываем новинки
    loadNewProducts()
    return
  }

  try {
    const { $directus, $readItems } = useNuxtApp()
    const response = await $directus.request($readItems('products', {
      filter: {
        status: { _eq: 'published' },
        title: { _icontains: searchQuery.value },
      },
      fields: ['*', 'images.*'],
      limit: 7,
    }))
    searchResults.value = response
  }
  catch (error) {
    console.error('Ошибка при поиске товаров:', error)
  }
}

// Наблюдатель за изменением поискового запроса
watch(searchQuery, (newValue) => {
  if (isSearchOpen.value) {
    searchProducts()
  }
})

// Закрыть поиск при клике вне (только для десктопной версии)
function onDocumentClick(event) {
  // Проверяем, что мы не на мобильной версии
  if (window.innerWidth <= 1165) {
    return
  }

  const searchContainer = document.querySelector('.search-container')
  const searchToggle = document.querySelector('.search-toggle')

  if (isSearchOpen.value
    && searchContainer
    && !searchContainer.contains(event.target)
    && !searchToggle.contains(event.target)) {
    isSearchOpen.value = false
  }
}

// Функция для очистки поискового запроса
function clearSearchQuery() {
  searchQuery.value = ''
  // Закрываем поиск при нажатии на крестик
  isSearchOpen.value = false
  // Разблокируем скролл
  document.body.style.overflow = ''
}

// При монтировании компонента
onMounted(() => {
  // Обновляем количество товаров в корзине на клиентской стороне
  updateCartCount()

  // Добавляем слушатель для обновления счетчика корзины при изменении хранилища
  window.addEventListener('storage', updateCartCount)

  // Создаем обработчик для события изменения корзины
  const handleCartUpdated = (e) => {
    updateCartCount()
  }

  // Добавляем слушатель события к document
  document.addEventListener('cart-updated', handleCartUpdated)

  // Добавляем обработчик для закрытия поиска при клике вне
  document.addEventListener('click', onDocumentClick)

  // Добавляем обработчик для события загрузки клиентского приложения
  if (typeof window !== 'undefined') {
    // Интервал для проверки localStorage и обновления счетчика
    // Это страховка, если компонент загрузится до того, как localStorage станет доступен
    const checkInterval = setInterval(() => {
      const count = getCartItemsCount()
      if (count !== cartItemsCount.value) {
        cartItemsCount.value = count
        // Если значение было успешно получено, останавливаем интервал
        clearInterval(checkInterval)
      }
    }, 100)

    // Очистка интервала через 2 секунды в любом случае
    setTimeout(() => clearInterval(checkInterval), 2000)
  }

  // Проверяем, что окно поиска закрыто при загрузке
  isSearchOpen.value = false
})

// Убеждаемся что скролл разблокирован при уничтожении компонента
// и удаляем все слушатели
onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('storage', updateCartCount)
  document.removeEventListener('cart-updated', updateCartCount)
  document.removeEventListener('click', onDocumentClick)
})

// Отображать счетчик только если в корзине есть товары
const showCartCounter = computed(() => cartItemsCount.value > 0)

// Форматирование цены
function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU').format(Number(price))
}
</script>

<template>
  <header class="header">
    <div class="container">
      <div class="burger" tabindex="0" @click="isMenuOpen = true">
        <span />
        <span />
        <span />
      </div>
      <div class="logo">
        <NuxtLink to="/">
          <img class="logo-img" src="/assets/icons/logo.svg" alt="Aero Store">
        </NuxtLink>
      </div>
      <nav class="navigation">
        <div class="nav-links">
          <NuxtLink to="/category/kvadrokoptery-1" class="nav-link">
            Квадрокоптеры
          </NuxtLink>
          <NuxtLink to="/category/aksessuary-2" class="nav-link">
            Аксессуары
          </NuxtLink>
          <NuxtLink to="/category/sputnikovaya-svyaz-3" class="nav-link">
            Спутниковая связь
          </NuxtLink>
          <NuxtLink to="/category/zaschita-ot-dronov-4" class="nav-link">
            Защита от дронов
          </NuxtLink>
          <NuxtLink to="/catalog" class="nav-link">
            Каталог
          </NuxtLink>
          <NuxtLink to="/about" class="nav-link">
            О нас
          </NuxtLink>
        </div>

        <div class="header-actions">
          <!-- Иконка поиска -->
          <div class="search-toggle" @click="toggleSearch">
            <img src="/assets/icons/search.svg" alt="Поиск" class="search-icon">
          </div>

          <div class="cart">
            <NuxtLink to="/cart" class="cart-link" @mouseenter="onCartMouseEnter" @mouseleave="onCartMouseLeave">
              <img class="cart-link-img" src="/assets/icons/cart.png" alt="Корзина">
              <span v-if="showCartCounter" class="cart-counter">{{ cartItemsCount }}</span>
            </NuxtLink>
            <CartPopup />
          </div>
        </div>
      </nav>

      <!-- Мобильные иконки -->
      <div class="mobile-actions">
        <!-- Мобильная иконка поиска -->
        <div class="mobile-search" @click.stop="toggleSearch">
          <img src="/assets/icons/search.svg" alt="Поиск">
        </div>
        <!-- Мобильная корзина -->
        <div class="mobile-cart">
          <NuxtLink to="/cart" class="cart-link">
            <img class="cart-link-img" src="/assets/icons/cart.png" alt="Корзина">
            <span v-if="showCartCounter" class="cart-counter">{{ cartItemsCount }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Попап поиска -->
    <transition name="fade">
      <div v-show="isSearchOpen" class="search-container">
        <div class="search-input-container">
          <input
            v-model="searchQuery"
            class="search-input"
            type="text"
            placeholder="Что вы ищите?"
            autofocus
            @input="searchProducts"
          >
          <button class="search-close" @click="clearSearchQuery">
            <img src="/assets/icons/close.svg" alt="Очистить">
          </button>
        </div>

        <div class="search-results-container">
          <h3 class="search-results-title">
            {{ searchQuery ? 'Результаты поиска' : 'НОВИНКИ' }}
          </h3>

          <div class="search-results">
            <NuxtLink
              v-for="product in searchResults"
              :key="product.id"
              :to="{ name: 'product-id', params: { id: `${slugify(product.title)}-${product.id}` } }"
              class="search-result-item"
              @click="isSearchOpen = false; document.body.style.overflow = ''"
            >
              <div class="search-result-image">
                <img :src="imgLink(product.images?.[0]?.directus_files_id)" :alt="product.title">
              </div>
              <div class="search-result-info">
                <div class="search-result-title">
                  {{ product.title }}
                </div>
                <div class="search-result-price">
                  {{ formatPrice(product.price) }} ₽
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="isMenuOpen" class="mobile-menu-overlay" @click.self="isMenuOpen = false">
        <div class="mobile-menu">
          <div class="mobile-menu-header">
            <div class="menu-logo">
              <NuxtLink to="/">
                <img src="/assets/icons/logo.svg" alt="Aero Store">
              </NuxtLink>
            </div>
            <button class="close-btn" aria-label="Закрыть меню" @click="isMenuOpen = false">
              &times;
            </button>
          </div>
          <nav class="mobile-navigation">
            <NuxtLink to="/category/kvadrokoptery-1" class="nav-link" @click="isMenuOpen = false">
              Квадрокоптеры
            </NuxtLink>
            <NuxtLink to="/category/aksessuary-2" class="nav-link" @click="isMenuOpen = false">
              Аксессуары
            </NuxtLink>
            <NuxtLink to="/category/sputnikovaya-svyaz-3" class="nav-link" @click="isMenuOpen = false">
              Спутниковая связь
            </NuxtLink>
            <NuxtLink to="/category/zaschita-ot-dronov-4" class="nav-link" @click="isMenuOpen = false">
              Защита от дронов
            </NuxtLink>
            <NuxtLink to="/catalog" class="nav-link" @click="isMenuOpen = false">
              Каталог
            </NuxtLink>
            <NuxtLink to="/about" class="nav-link" @click="isMenuOpen = false">
              О нас
            </NuxtLink>
          </nav>
          <div class="mobile-contact-info">
            <div class="contact-label">
              Мы на связи
              <a href="tel:+79932787007" class="contact-phone">+7 (993) 278-70-07</a>
              <a href="https://t.me/aerostore_tech" class="contact-phone">Telegram</a>
              <a href="https://wa.me/79932787007" class="contact-phone">WhatsApp</a>
            </div>
            <div class="contact-label">
              Мы находимся
              <div class="contact-address">
              г. Москва, Багратионовский проезд 7к20в
            </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>

<style lang="scss" scoped>
$menu-radius: 16px;
$menu-bg: #181818;
$menu-shadow: 0 8px 32px rgba(0,0,0,0.25);
$menu-padding: 40px 24px 32px 24px;
$burger-width: 40px;
$burger-bar-width: 32px;
$burger-bar-height: 3px;
$burger-gap: 7px;
$cart-min-width: 40px;
$logo-width: 135px;
$logo-height: 50px;
$nav-gap: 55px;
$mobile-nav-gap: 32px;
$mobile-nav-font-size: 1.3rem;
$close-btn-size: 2.5rem;

.header {
  background-color: var(--primary-color);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0;

  .container {
    max-width: 1166px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 25px;
    position: relative;
    padding: 21px 0;
  }

  .burger {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: $burger-gap;
    width: $burger-width;
    height: $burger-width;
    cursor: pointer;
    margin-right: 10px;
    position: relative;
    z-index: 2;

    span {
      display: block;
      height: $burger-bar-height;
      width: $burger-bar-width;
      background: #AEAEAE;
      border-radius: 2px;
      transition: 0.3s;
    }
  }

  .logo {
    width: 135px;
    display: flex;
    justify-content: center;
    align-items: center;

    .logo-img {
      height: $logo-height;
      width: $logo-width;

      @media (max-width: 1165px) {
        height: 38px;
        width: 102px;
      }
    }
  }

  .mobile-actions {
    display: none;
    align-items: center;
    gap: 15px;
    z-index: 1010; /* Увеличиваем z-index */

    .mobile-search {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 24px;
      height: 24px;

      img {
        width: 24px;
        height: 24px;
      }
    }

    .mobile-cart {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      .cart-link {
        color: var(--secondary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        transition: opacity 0.2s;
        position: relative;

        &:hover {
          opacity: 0.8;
        }

        .cart-link-img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .navigation {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgb(22, 22, 22);
    backdrop-filter: blur(42px); /* Размытие фона */
    padding: 16px 30px;
    border-radius: 10px;

    .nav-links {
      display: flex;
      align-items: center;
      gap: 50px;
    }

    .nav-link {
      color: #AEAEAE;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
      font-weight: 500;
      line-height: 100%;
      &:hover {
        color: var(--secondary-color);
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-toggle {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      .search-icon {
        width: 16px;
        height: 16px;
        opacity: 0.8;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }
      }
    }

    .cart {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: $cart-min-width;
      position: relative;

      .cart-link {
        color: var(--secondary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 25px;
        height: 25px;
        transition: opacity 0.2s;
        position: relative;

        &:hover {
          opacity: 0.8;
        }
      }

      .cart-link-img {
        width: 16px;
        height: 16px;
      }
    }
  }

  .menu {
    display: none;
  }

  // Мобильное меню
  .mobile-menu-overlay {
    position: fixed;
    z-index: 2000;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;

    .mobile-menu {
      width: 100%;
      height: 100%;
      padding: 0;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: none;
      background: transparent;
      border-radius: 0;

      .mobile-menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 15px 15px 25px;
        border-bottom: 1px solid #AEAEAE;

        .menu-logo {
          a {
            display: block;
          }

          img {
            height: 38px;
            width: 102px;
          }
        }

        .close-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 3.5rem;
          cursor: pointer;
          line-height: 1;
          padding: 0;
        }
      }

      .mobile-navigation {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 20px 25px;
        align-items: flex-start;

        .nav-link {
          color: #fff;
          font-size: 16px;
          font-weight: 400;
          text-decoration: none;
          padding: 10px 0;
        }
      }

      .mobile-contact-info {
        margin-top: auto;
        padding: 20px 25px;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .contact-label {
          color: #fff;
          font-size: 14px;
          margin-bottom: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .contact-phone {
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
        }

        .contact-address {
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 10px;

          @media (max-width: 1200px) {
            margin-right: 60px;
          }
        }
      }
    }
  }

  // Анимация появления меню
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }

  @media (max-width: 1165px) {
    .navigation {
      display: none;
    }
    .burger {
      display: flex;
    }
    .container {
      justify-content: space-between;
      padding: 15px;
    }
    .logo {
      position: absolute;
      left: 0;
      right: 0;
      margin: 0 auto;
      justify-content: center;
      z-index: 1;
    }
    .mobile-actions {
      display: flex;
      z-index: 2;
    }
  }

  @media (min-width: 1166px) {
    .mobile-menu-overlay {
      display: none !important;
    }
    .mobile-actions {
      display: none;
    }
  }
}

.cart-counter {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f44336;
  color: white;
  font-size: 10px;
  font-weight: bold;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-in-out;
}

.search-container {
  position: absolute;
  top: 86px;
  left: 0;
  width: 100%;
  height: 380px;
  background-color: #f8f8f8;
  z-index: 1001;
  padding: 20px 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;

  .search-input-container {
    position: relative;
    margin: 0 auto;
    max-width: 1166px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30px;

    .search-input {
      width: calc(100% - 40px);
      height: 42px;
      padding: 0 32px;
      border: none;
      background-color: unset;
      border: 1px solid #000000;
      color: #000;
      border-radius: 40px;
      font-size: 16px;
      font-family: 'Montserrat', sans-serif;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;

      &:focus {
        outline: none;
        font-size: 16px;
      }

      &::placeholder {
        color: #777;
      }
    }

    .search-close {
      margin-left: 15px;
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;

      img {
        width: 15px;
        height: 15px;
      }

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .search-results-container {
    max-width: 1166px;
    margin: 0 auto;
    height: calc(100% - 90px);
    overflow: hidden;

    .search-results-title {
      font-size: 20px;
      margin-bottom: 15px;
      font-weight: 700;
      text-transform: uppercase;
      font-family: 'Montserrat', sans-serif;
    }

    .search-results {
      display: flex;
      flex-wrap: nowrap;
      gap: 16px;
      justify-content: flex-start;

      .search-result-item {
        cursor: pointer;
        transition: all 0.2s;
        width: calc((100% - 96px) / 7); /* 7 карточек в ряд с учетом отступов */
        border-radius: 8px;
        overflow: hidden;

        &:hover {
          transform: translateY(-2px);
        }

        .search-result-image {
          width: 100%;
          aspect-ratio: 1/1;
          background-color: #ffffff;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          height: 115px;
          border-radius: 15px;

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }

        .search-result-info {
          flex: 1;
          padding: 0;
          text-align: left;
          padding-right: 0;

          .search-result-title {
            color: #000;
            font-size: 14px;
            text-align: left;
            height: auto;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            display: -webkit-box;
            overflow: hidden;
            margin-bottom: 4px;
            font-weight: 500;
            line-height: 1.3;
            max-height: 36px; /* Примерно 2 строки при font-size 14px и line-height 1.3 */
          }

          .search-result-price {
            color: #000;
            font-size: 14px;
            font-weight: 700;
            text-align: left;
            position: static;
            right: auto;
            top: auto;
            transform: none;
          }
        }
      }
    }
  }

  @media (max-width: 1165px) {
    position: fixed;
    top: 0; /* Высота шапки в мобильной версии */
    left: 0;
    width: 100%;
    height: 100vh; /* Полная высота экрана минус высота шапки */
    background-color: #f2f2f2;
    z-index: 1001; /* Увеличиваем z-index, но меньше чем у шапки */
    padding: 20px;
    display: flex;
    flex-direction: column;

    .search-input-container {
      margin-top: 0;
      margin-bottom: 25px;
      padding: 0;

      .search-input {
        width: calc(100% - 40px);
        border: 1px solid #000;
        border-radius: 40px;
        color: #000;
        background-color: #fff;
      }

      .search-close {
        margin-left: 15px;

        img {
          filter: none;
        }
      }
    }

    .search-results-container {
      padding: 0;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 155px); /* Высота экрана минус высота шапки, инпута и отступов */
      margin: 0;
      position: relative;
      overflow: hidden;

      .search-results-title {
        color: #000;
        font-size: 24px;
        font-weight: 700;
        position: sticky;
        top: 0;
        background-color: #f2f2f2;
        z-index: 5;
      }

      .search-results {
        flex-direction: column;
        flex-wrap: nowrap;
        gap: 0;
        justify-content: flex-start;
        overflow-y: auto;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE и Edge */
        height: 100%;
        
        &::-webkit-scrollbar {
          display: none; /* Chrome, Safari и Opera */
        }

        .search-result-item {
          width: 100%;
          margin-bottom: 0;
          background-color: transparent;
          padding: 15px 0;
          display: flex;
          align-items: flex-start;
          position: relative;
          border-radius: 0;

          &:not(:last-child) {
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          }

          .search-result-image {
            width: 70px;
            height: 48px;
            aspect-ratio: auto;
            background-color: #fff;
            border-radius: 10px;
            margin-bottom: 0;
            margin-right: 15px;
            flex-shrink: 0;
          }

          .search-result-info {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            flex: 1;
            padding: 0;

            .search-result-title {
              color: #000;
              font-size: 14px;
              text-align: left;
              height: auto;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              display: -webkit-box;
              overflow: hidden;
              margin-bottom: 0;
              margin-right: 10px;
              font-weight: 500;
              line-height: 1.3;
              max-height: 36px;
              flex: 1;
            }

            .search-result-price {
              color: #000;
              font-size: 14px;
              font-weight: 700;
              text-align: right;
              white-space: nowrap;
              flex-shrink: 0;
            }
          }
        }
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}
</style>
