<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goToHome = () => {
  router.push('/');
};
</script>

<template>
  <main class="not-found">
    <UiContainer>
      <div class="not-found__content">
        <h1 class="not-found__title">404</h1>
        <p class="not-found__text">Страница не найдена</p>
        <UiButton 
          text="На главную" 
          @click="goToHome" 
          width="200px"
          height="50px"
        />
      </div>
    </UiContainer>
  </main>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 50px 20px;
  
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  &__title {
    font-family: 'Unbounded', sans-serif;
    font-size: 120px;
    font-weight: 700;
    margin-bottom: 20px;
    color: var(--primary-color);
  }
  
  &__text {
    font-family: 'Montserrat', sans-serif;
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 40px;
    color: var(--primary-color);
  }
  
  @media (max-width: 768px) {
    &__title {
      font-size: 80px;
    }
    
    &__text {
      font-size: 18px;
      margin-bottom: 30px;
    }
  }
}
</style> 