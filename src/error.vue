<script setup lang="ts">
import { onMounted } from 'vue';
import { clearError } from '#app';

defineProps({
  error: Object
});

// Сброс ошибки
const handleError = () => clearError({ redirect: '/404' });

// Автоматический редирект на 404 при загрузке компонента ошибки
onMounted(() => {
  handleError();
});
</script>

<template>
  <div>
    <!-- Страница загрузки или ожидания -->
    <UiContainer>
      <div class="error-loading">
        <p>Перенаправление...</p>
      </div>
    </UiContainer>
  </div>
</template>

<style lang="scss" scoped>
.error-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  color: var(--primary-color);
}
</style> 