<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useCart } from '@/composables/useCart';
import { useRouter } from 'vue-router';
import { useEventBus } from '@/composables/useEventBus';

const props = defineProps({
  id: {
    type: String,
    required: false
  },
  text: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: false,
    default: '#fff'
  },
  bgColor: {
    type: String,
    required: false,
    default: 'var(--primary-color)'
  },
  height: {
    type: String,
    required: false,
    default: '40px'
  },
  width: {
    type: String,
    required: false,
    default: '90%'
  },
  productInfo: {
    type: Object,
    required: false,
    default: null
  }
});

const emit = defineEmits(['cart-updated', 'click']);
const router = useRouter();
const eventBus = useEventBus();

// Get the cart functions from our composable
const { addToCart: addItemToCart, getCart } = useCart();

// For showing "В корзине" text
const buttonText = ref(props.text);
const isAddedToCart = ref(false);

// Проверка состояния корзины
const checkCartState = () => {
  if (props.id) {
    const cart = getCart();
    const isInCart = cart.some(item => item.id === props.id);
    isAddedToCart.value = isInCart;
    buttonText.value = isInCart ? 'В корзине' : props.text;
  }
};

// Проверяем состояние корзины при загрузке компонента
onMounted(() => {
  checkCartState();
  
  // Слушаем событие удаления товара из корзины
  eventBus.on('cart-product-removed', (productId: string) => {
    if (props.id === productId) {
      isAddedToCart.value = false;
      buttonText.value = props.text;
    }
  });
});

// Очищаем слушатели при удалении компонента
onUnmounted(() => {
  eventBus.off('cart-product-removed');
});

// Update button text when props change
watch(() => props.text, (newText) => {
  if (!isAddedToCart.value) {
    buttonText.value = newText;
  }
});

// Также обновляем состояние кнопки при событии обновления корзины
watch(() => document.addEventListener('cart-updated', () => {
  setTimeout(() => checkCartState(), 100); // Небольшая задержка для обновления localStorage
}), { immediate: true });

// Handle the add to cart click
const addToCart = (event: MouseEvent) => {
  // Always stop propagation and prevent default first
  event.stopPropagation();
  event.preventDefault();
  
  // Если товар уже в корзине, переходим в корзину
  if (isAddedToCart.value && props.id) {
    router.push('/cart');
    return;
  }
  
  // Emit regular click event
  emit('click', event);
  
  // Only proceed if we have an ID (for cart buttons)
  if (props.id) {
    try {
      const success = addItemToCart(props.id);
      
      if (success) {
        // Show "В корзине" text permanently
        isAddedToCart.value = true;
        buttonText.value = 'В корзине';
        
        // Emit cart updated event
        emit('cart-updated', event);
        
        // Отправить событие о добавлении товара в корзину через шину событий
        if (props.productInfo) {
          eventBus.emit('product-added-to-cart', {
            id: props.id,
            ...props.productInfo
          });
        }
        
        // Отправить событие для обновления счетчика в шапке
        document.dispatchEvent(new CustomEvent('cart-updated'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }
};
</script>

<template>
  <button 
    type="button"
    @click="addToCart" 
    class="ui-button" 
    :class="{ 'ui-button--added': isAddedToCart }"
    :style="{ backgroundColor: isAddedToCart ? '#28a745' : bgColor, height: height, width: width }"
  >
    <span class="ui-button__text" :style="{ color: color }">{{ buttonText }}</span>
    <slot name="icon" />
  </button>
</template>

<style lang="scss" scoped>
.ui-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  height: 42px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background-color: var(--primary-color);
  border: none;
  outline: none;
  border-radius: 42px;
  padding: 12px 22px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 2;

  &:hover {
    opacity: 0.8;
  }

  &--added {
    background-color: #28a745 !important;
  }

  @media (max-width: 1165px) {
    gap: 10px;
  }
}
</style>
