<script setup>
import { IconCheck } from '@tabler/icons-vue'
</script>

<template>
  <div class="order-success">
    <div class="order-success__container">
      <h1 class="order-success__title">Заказ успешно оформлен!</h1>
      <p class="order-success__message">
        Благодарим вас за заказ! Наш менеджер свяжется с вами в ближайшее время для уточнения деталей.
      </p>
      <div class="order-success__actions">
        <NuxtLink to="/catalog" class="btn btn--primary">В каталог</NuxtLink>
        <NuxtLink to="/" class="btn btn--secondary">На главную</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-success {
  min-height: 90vh;
  width: 100%;
  max-width: 1166px;
  margin: 0 auto;
  padding: 142px 0 30px 0;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 1165px) {
    padding: 90px 15px 30px 15px;
  }
  
  &__container {
    width: 100%;
    border-radius: 30px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  &__title {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 20px;
    color: #000;
  }
  
  &__message {
    font-size: 16px;
    color: #333;
    margin-bottom: 30px;
    line-height: 1.5;
  }
  
  &__actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;

    @media (max-width: 499px) {
      align-items: center;
    }
    
    @media (min-width: 500px) {
      flex-direction: row;
      justify-content: center;
    }
  }
}

// Стили кнопок
.btn {
  display: block;
  padding: 15px 20px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 300px;
  text-decoration: none;
  
  &--primary {
    background-color: #000;
    color: #fff;
    
    &:hover {
      background-color: #333;
    }
  }
  
  &--secondary {
    background-color: #fff;
    color: #000;
    border: 1px solid #ddd;
    
    &:hover {
      background-color: #f5f5f5;
    }
  }
}
</style> 