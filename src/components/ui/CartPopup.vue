<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useEventBus } from '@/composables/useEventBus';
import { imgLink } from '@/utils/imgLink';
import { useRouter } from 'vue-router';
import { useCart } from '@/composables/useCart';
import { useNuxtApp } from 'nuxt/app';

interface ProductData {
  id: string;
  title: string;
  price: number | string;
  image: string;
  quantity?: number;
  [key: string]: any;
}

const eventBus = useEventBus();
const router = useRouter();
const { getCart, removeFromCart } = useCart();
const isVisible = ref(false);
const products = ref<ProductData[]>([]);
let timeout: number | null = null;

// Проверка, находимся ли мы на странице корзины
const isCartPage = () => {
  return router.currentRoute.value.path === '/cart';
};

// Получение данных о товарах в корзине
const getCartProducts = async () => {
  try {
    const cartItems = getCart();
    
    if (cartItems.length === 0) {
      return [];
    }
    
    // Получаем Directus клиент для запросов
    const { $directus, $readItems } = useNuxtApp();
    
    // Получаем информацию о товарах
    const productIds = cartItems.map(item => item.id);
    
    const productsData = await $directus.request($readItems('products', {
      filter: {
        id: {
          _in: productIds
        }
      },
      fields: ['*', 'images.*'],
    }));
    
    // Формируем данные о товарах для отображения в попапе
    return productsData.map((productData: any) => {
      const cartItem = cartItems.find(item => item.id === productData.id);
      return {
        id: productData.id,
        title: productData.title,
        price: productData.price,
        quantity: cartItem?.quantity || 1,
        image: productData.images?.[0]?.directus_files_id || ''
      };
    });
  } catch (error) {
    console.error('Error getting cart products:', error);
    return [];
  }
};

// Обновление списка товаров в корзине
const updateCartProducts = async () => {
  const cartProducts = await getCartProducts();
  products.value = cartProducts;
  
  // Если корзина стала пустой или мы на странице корзины, скрываем попап
  if (cartProducts.length === 0 || isCartPage()) {
    isVisible.value = false;
  }
  
  // Отправляем событие для обновления счетчика корзины в шапке
  document.dispatchEvent(new CustomEvent('cart-updated'));
};

// Слушаем событие добавления товара в корзину
onMounted(() => {
  eventBus.on('product-added-to-cart', async (productData: ProductData) => {
    // Если мы на странице корзины, не показываем попап
    if (isCartPage()) {
      return;
    }
    
    // Добавляем новый товар в начало списка
    products.value = [productData, ...products.value.filter(p => p.id !== productData.id)];
    isVisible.value = true;
    
    // Очищаем предыдущий таймер, если он существует
    if (timeout) {
      clearTimeout(timeout);
    }
    
    // Автоматически скрываем окно через 5 секунд
    timeout = setTimeout(() => {
      isVisible.value = false;
    }, 5000);
  });

  // Слушаем событие наведения на иконку корзины
  eventBus.on('cart-icon-mouseenter', async () => {
    // Если мы на странице корзины, не показываем попап
    if (isCartPage()) {
      return;
    }
    
    const cartItems = getCart();
    
    if (cartItems && cartItems.length > 0) {
      // Загружаем данные о товарах в корзине
      const cartProducts = await getCartProducts();
      if (cartProducts.length > 0) {
        products.value = cartProducts;
        isVisible.value = true;
        
        // Очищаем таймер автоскрытия при наведении
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      }
    }
  });
  
  // Слушаем событие ухода мыши с иконки корзины
  eventBus.on('cart-icon-mouseleave', () => {
    // Не скрываем сразу при уходе с иконки, чтобы можно было навести на попап
    // Устанавливаем таймер для скрытия с небольшой задержкой
    if (!timeout) {
      timeout = setTimeout(() => {
        // Проверяем, что мышь не наведена на попап перед скрытием
        isVisible.value = false;
      }, 300);
    }
  });
});

// Очищаем слушатели при размонтировании компонента
onUnmounted(() => {
  eventBus.off('product-added-to-cart');
  eventBus.off('cart-icon-mouseenter');
  eventBus.off('cart-icon-mouseleave');
  if (timeout) {
    clearTimeout(timeout);
  }
});

// Закрыть всплывающее окно
const closePopup = () => {
  isVisible.value = false;
  if (timeout) {
    clearTimeout(timeout);
  }
};

// Перейти в корзину
const goToCart = () => {
  router.push('/cart');
  closePopup();
};

// Перейти к товару
const goToProduct = (productId: string, event: Event) => {
  // Проверяем, что клик был не по кнопке удаления
  if (!(event.target as HTMLElement).closest('.cart-popup__product-remove')) {
    router.push(`/product/${productId}`);
    closePopup();
  }
};

// Удалить товар из корзины
const deleteProduct = async (productId: string, event: Event) => {
  event.stopPropagation(); // Предотвращаем всплытие события
  
  // Удаляем товар из корзины
  removeFromCart(productId);
  
  // Обновляем список товаров
  await updateCartProducts();
  
  // Отправляем событие об удалении товара из корзины для обновления состояния кнопок
  eventBus.emit('cart-product-removed', productId);
};

// Обработчик события наведения мыши на попап
const handleMouseEnter = () => {
  // Очищаем таймер автоскрытия при наведении на попап
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
};

// Обработчик события ухода мыши с попапа
const handleMouseLeave = () => {
  // Устанавливаем таймер для скрытия попапа
  timeout = setTimeout(() => {
    isVisible.value = false;
  }, 300); // Небольшая задержка для лучшего UX
};

// Получение суммы товаров в корзине
const getTotalPrice = () => {
  return products.value.reduce((total, item) => {
    return total + Number(item.price) * (item.quantity || 1);
  }, 0);
};
</script>

<template>
  <transition name="fade">
    <div 
      v-if="isVisible && products.length > 0" 
      class="cart-popup"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <div class="cart-popup__content">
        <div 
          v-for="product in products" 
          :key="product.id" 
          class="cart-popup__product"
          @click="goToProduct(product.id, $event)"
          title="Нажмите для перехода к товару"
        >
          <div class="cart-popup__product-image">
            <img :src="imgLink(product.image)" :alt="product.title">
          </div>
          <div class="cart-popup__product-info">
            <div class="cart-popup__product-title">{{ product.title }}</div>
            <div class="cart-popup__product-quantity">{{ product.quantity || 1 }} шт.</div>
          </div>
          <div class="cart-popup__product-price">
            {{ new Intl.NumberFormat('ru-RU').format(Number(product.price) * (product.quantity || 1)) }} ₽
          </div>
          <button 
            class="cart-popup__product-remove" 
            @click="deleteProduct(product.id, $event)"
            title="Удалить товар"
          >
            &times;
          </button>
        </div>
      </div>
      <div class="cart-popup__footer">
        <div class="cart-popup__actions">
          <div class="cart-popup__total">
            <span>Итого:</span>
            <span>{{ new Intl.NumberFormat('ru-RU').format(getTotalPrice()) }} ₽</span>
          </div>
          <button @click="goToCart" class="cart-popup__checkout">В корзину</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.cart-popup {
  position: absolute;
  top: calc(100% + 5px);
  right: -5px;
  width: 500px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1500;
  overflow: hidden;
  
  @media (max-width: 767px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    border-radius: 0 0 12px 12px;
    margin-top: 0;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    padding: 0 15px;
    box-sizing: border-box;
  }
  
  &__content {
    max-height: 300px;
    overflow-y: auto;
    
    @media (max-width: 767px) {
      padding: 0;
      flex: 1;
      order: 1;
      max-height: none;
      overflow-y: visible;
    }
  }
  
  &__product {
    display: flex;
    align-items: center;
    padding: 16px;
    position: relative;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: #f5f5f5;
      
      .cart-popup__product-remove {
        opacity: 1;
      }
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid #eee;
    }
    
    @media (max-width: 767px) {
      padding-bottom: 0;
      flex-wrap: nowrap;
      width: 100%;
    }
  }
  
  &__product-image {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    overflow: hidden;
    margin-right: 12px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    @media (max-width: 767px) {
      width: 36px;
      height: 36px;
      margin-right: 8px;
      flex-shrink: 0;
    }
  }
  
  &__product-info {
    flex: 1;
    min-width: 0; // Важно для работы ellipsis в дочерних элементах
    
    @media (max-width: 767px) {
      margin-right: 10px;
    }
  }
  
  &__product-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    
    @media (max-width: 767px) {
      font-size: 12px;
      margin-bottom: 2px;
      max-width: 100%;
    }
  }
  
  &__product-quantity {
    font-size: 12px;
    color: #666;
    
    @media (max-width: 767px) {
      font-size: 10px;
    }
  }
  
  &__product-price {
    font-size: 14px;
    font-weight: 700;
    color: #333;
    margin-right: 24px;
    text-align: right;
    white-space: nowrap;
    
    @media (max-width: 767px) {
      font-size: 12px;
      margin: 0;
      flex-shrink: 0;
    }
  }
  
  &__product-remove {
    background: none;
    border: none;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #999;
    cursor: pointer;
    border-radius: 50%;
    padding: 0;
    opacity: 0.5;
    transition: opacity 0.2s ease, color 0.2s ease, background-color 0.2s ease;
    flex-shrink: 0;
    
    &:hover {
      color: #fff;
      background-color: #f44336;
      opacity: 1;
    }
    
    @media (max-width: 767px) {
      opacity: 1;
      margin-left: 10px;
    }
  }
  
  &__footer {
    padding: 12px 16px;
    border-top: 1px solid #eee;
    background-color: #f9f9f9;
    
    @media (max-width: 767px) {
      padding: 0;
      border-top: none;
      order: 2;
      margin-left: 15px;
      flex-shrink: 0;
    }
  }
  
  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  &__total {
    font-weight: 700;
    color: #333;
    display: flex;
    gap: 10px;
    
    span:last-child {
      font-size: 16px;
    }
    
    @media (max-width: 767px) {
      display: none;
    }
  }
  
  &__checkout {
    background-color: var(--primary-color);
    color: #fff;
    border: none;
    border-radius: 24px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    
    &:hover {
      opacity: 0.9;
    }
    
    @media (max-width: 767px) {
      padding: 6px 12px;
      font-size: 12px;
      white-space: nowrap;
      width: auto;
    }
  }
}

.fade-enter-active, 
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from, 
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  
  @media (max-width: 767px) {
    transform: translateY(-100%);
  }
}
</style> 