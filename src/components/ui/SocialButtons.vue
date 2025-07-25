<template>
  <div class="social-buttons">
    <button class="social-buttons__toggle" @click="toggleButtons" v-if="!isOpen">
      <img src="@/assets/icons/socials.png" alt="Социальные сети" width="32" height="32">
    </button>
    <transition name="fade">
      <div v-if="isOpen" class="social-buttons__list">
        <a href="https://t.me/aerostore_tech" target="_blank" class="social-buttons__item social-buttons__item--telegram">
          <img src="@/assets/icons/telegram.png" alt="Telegram" width="38" height="38">
        </a>
        <a href="https://wa.me/79932787007" target="_blank" class="social-buttons__item social-buttons__item--whatsapp">
          <img src="@/assets/icons/whatsapp.png" alt="WhatsApp" width="38" height="38">
        </a>
        <button @click="closeButtons" class="social-buttons__item social-buttons__item--close">
          <span class="social-buttons__close-icon">×</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

function toggleButtons() {
  isOpen.value = !isOpen.value
}

function closeButtons() {
  isOpen.value = false
}
</script>

<style scoped>
.social-buttons {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.social-buttons__toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #000000;
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  transition: all 0.3s ease;

  @media (max-width: 1200px) {
    background-color: #131313;
  }
}

.social-buttons__toggle:hover {
  transform: scale(1.05);
}

.social-buttons__list {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.social-buttons__item {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-buttons__item:hover {
  transform: scale(1.05);
}

.social-buttons__item--telegram {
  background-color: #ffffff;
  animation: slideUp 0.3s ease forwards;
  animation-delay: 0.1s;
  opacity: 0;
  transform: translateY(20px);
}

.social-buttons__item--whatsapp {
  background-color: #ffffff;
  animation: slideUp 0.3s ease forwards;
  animation-delay: 0.2s;
  opacity: 0;
  transform: translateY(20px);
}

.social-buttons__item--close {
  background-color: #000000;
  border: none;
  cursor: pointer;
  animation: slideUp 0.3s ease forwards;
  animation-delay: 0.3s;
  opacity: 0;
  transform: translateY(20px);
}

.social-buttons__close-icon {
  font-size: 38px;
  color: #fff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 