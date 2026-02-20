<script setup>
import { useNuxtApp } from '#app'
import { ref, watch } from 'vue'
// Импортируем необходимые компоненты для работы с Map
import Map from './Map.vue'
// Импортируем composable для маски телефона
import { usePhoneMask } from '@/composables/usePhoneMask'

const items = [
  {
    title: 'Адрес',
    text: 'г. Петропавловск-Камчатский, ул. Лукашевского, 5, 1 этаж, ТЦ Планета',
  },
  {
    title: 'Время работы',
    text: 'Мы работаем без выходных – с 10:00 до 19:00',
  },
  {
    title: 'Есть вопросы?',
    text: 'Позвоните нам или используйте кнопки обратной связи',
  },
]

const showCallbackModal = ref(false)
const phoneNumber = ref('')
const userName = ref('')
const phoneError = ref('')
const nameError = ref('')
const isValidated = ref(false) // Флаг, показывающий, была ли попытка валидации
const isSubmitting = ref(false) // Флаг отправки данных
const submitSuccess = ref(false) // Флаг успешной отправки
const submitError = ref('') // Сообщение об ошибке при отправке

// Используем composable для маски телефона
const { phone, formattedPhone, handlePhoneInput, setPhone, clearPhone } = usePhoneMask()

// Синхронизируем значение телефона из композабла с phoneNumber
watch(phone, (value) => {
  phoneNumber.value = value
})

// Валидация номера телефона
function validatePhone() {
  const digitsOnly = /^\d+$/

  if (!phoneNumber.value.trim()) {
    phoneError.value = 'Введите номер телефона'
    return false
  }

  if (!digitsOnly.test(phoneNumber.value)) {
    phoneError.value = 'Номер телефона должен содержать только цифры'
    return false
  }

  if (phoneNumber.value.length < 10) {
    phoneError.value = 'Номер телефона должен содержать минимум 10 цифр'
    return false
  }

  phoneError.value = ''
  return true
}

// Валидация имени - только кириллица без цифр
function validateName() {
  const cyrillicPattern = /^[а-яА-ЯёЁ\s-]+$/

  if (!userName.value.trim()) {
    nameError.value = 'Введите имя'
    return false
  }

  if (userName.value.trim().length < 2) {
    nameError.value = 'Имя должно содержать минимум 2 символа'
    return false
  }

  if (!cyrillicPattern.test(userName.value)) {
    nameError.value = 'Имя должно содержать только кириллицу'
    return false
  }

  nameError.value = ''
  return true
}

// Обработчик ввода для имени
function handleNameInput(event) {
  // Если была попытка валидации, то валидируем при вводе
  if (isValidated.value) {
    validateName()
  }
}

function openCallbackrequestModal() {
  showCallbackModal.value = true
  // Сбрасываем значения полей
  phoneNumber.value = ''
  userName.value = ''
  isValidated.value = false
  phoneError.value = ''
  nameError.value = ''
  clearPhone() // Очищаем маску телефона
}

function closeCallbackModal() {
  showCallbackModal.value = false
  phoneNumber.value = ''
  userName.value = ''
  phoneError.value = ''
  nameError.value = ''
  isValidated.value = false
  clearPhone() // Очищаем маску телефона
}

async function submitCallbackRequest() {
  // Устанавливаем флаг, что была попытка валидации
  isValidated.value = true

  // Проверяем валидность перед отправкой
  const isPhoneValid = validatePhone()
  const isNameValid = validateName()

  if (isPhoneValid && isNameValid) {
    try {
      isSubmitting.value = true
      submitError.value = ''

      // Формируем данные для отправки
      const feedbackData = {
        name: userName.value,
        phone: phoneNumber.value,
        type: 'callback', // Тип обратной связи - обратный звонок
        status: 'Не обработано', // Статус заявки - новая
        date_created: new Date().toISOString(), // Дата создания
      }

      // Отправляем данные через API endpoint
      const response = await $fetch('/api/feedback/create', {
        method: 'POST',
        body: feedbackData,
      })

      if (response.success) {
        // Отмечаем успешную отправку
        submitSuccess.value = true

        // Закрываем модальное окно через 1.5 секунды
        setTimeout(() => {
          closeCallbackModal()
        }, 1500)
      }
    }
    catch (error) {
      console.error('Error sending callback request:', error)
      submitError.value = 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.'
    }
    finally {
      isSubmitting.value = false
    }
  }
}
</script>

<template>
  <div class="location">
    <div class="location__container">
      <div class="location__info">
        <h2 class="location__title">
          ГДЕ МЫ НАХОДИМСЯ
        </h2>
        <div v-for="item in items" :key="item.id" class="location__info-item">
          <div class="location__info-item-title">
            {{ item.title }}
          </div>
          <div class="location__info-item-text">
            {{ item.text }}
          </div>
        </div>
        <div class="location__buttons">
          <a href="tel:+79932787007" class="location__button location__button-grey">+7 (993) 278-70-07</a>
          <button class="location__button location__button-black" @click="openCallbackrequestModal">
            Обратный звонок
          </button>   
        </div>
      </div>
      <div class="location__map">
        <Map />
      </div>
    </div>

    <!-- Callback Modal -->
    <div v-if="showCallbackModal" class="callback-modal">
      <div class="callback-modal__overlay" @click="closeCallbackModal" />
      <div class="callback-modal__content">
        <button class="callback-modal__close" @click="closeCallbackModal">
          ×
        </button>
        <h3 class="callback-modal__title">
          Заказать обратный звонок
        </h3>
        <div class="callback-modal__form">
          <div class="callback-modal__field">
            <label for="name">Как к вам обращаться <span class="required">*</span></label>
            <input
              id="name"
              v-model="userName"
              type="text"
              placeholder="Иванов Иван"
              :class="{ 'input-error': nameError && isValidated }"
              @input="handleNameInput"
            >
            <div v-if="nameError && isValidated" class="error-message">
              {{ nameError }}
            </div>
          </div>
          <div class="callback-modal__field">
            <label for="phone">Номер телефона <span class="required">*</span></label>
            <input
              id="phone"
              :value="formattedPhone"
              type="tel"
              placeholder="+7 (___) ___ ____"
              :class="{ 'input-error': phoneError && isValidated }"
              @input="handlePhoneInput"
            >
            <div v-if="phoneError && isValidated" class="error-message">
              {{ phoneError }}
            </div>
          </div>
          <div v-if="submitError" class="error-message callback-modal__error">
            {{ submitError }}
          </div>
          <div
            v-if="submitSuccess"
            class="success-message callback-modal__success"
          >
            Ваша заявка успешно отправлена!
          </div>
          <button
            v-else
            class="callback-modal__submit location__button location__button-black"
            :disabled="isSubmitting"
            @click="submitCallbackRequest"
          >
            <span v-if="isSubmitting">Отправка...</span>
            <span v-else>Заказать обратный звонок</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.location {
    width: 100%;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 15px;

    &__container {
        height: 100%;
        max-width: 1166px;
        width: 100%;
        padding: 50px 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 61px;

        @media (max-width: 1165px) {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
        }
    }

    &__info {
        max-width: 460px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;

        @media (max-width: 1165px) {
          width: 100%;
          max-width: unset;
        }
    }

    &__info-item {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 4px;
        margin-bottom: 20px;
    }

    &__info-item-title {
        font-family: 'Montserrat', sans-serif;
        color: #000;
        font-size: 14px;
        font-weight: 700;
    }

    &__info-item-text {
        color: #000;
        font-size: 14px;
        font-weight: 400;
    }

    &__buttons {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 23px;

        @media (max-width: 1165px) {
            justify-content: space-between;
        }
    }

    &__button {
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 500;
        border-radius: 50px;
        border: none;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;

        @media (max-width: 1165px) {
          width: 50%;
          font-size: 12px;
          padding: 12px 20px;
        }
    }

    &__button-black {
        background-color: #000;
        color: #fff;

        &:hover {
        background-color: #fff;
        color: #000;
        cursor: pointer;
        }
    }

    &__button-grey {
        background-color: #D8D8D8;
        color: #000;

        &:hover {
        background-color: #000;
        color: #fff;
        cursor: pointer;
        }
    }

    &__title {
        font-family: 'Montserrat', sans-serif;
        color: #000;
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 20px;

        @media (max-width: 1165px) {
            margin-bottom: 51px;
        }
    }

    &__map {
        height: 290px;
        width: 689px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 25px;

        @media (max-width: 1165px) {
            width: 100%;
        }
    }
}

.callback-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  &__content {
    position: relative;
    width: 100%;
    max-width: 400px;
    background-color: #fff;
    border-radius: 15px;
    padding: 30px;
    z-index: 1001;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    margin: 0px 16px;
  }

  &__close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #000;
  }

  &__title {
    font-family: 'Montserrat', sans-serif;
    color: #000;
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 20px;
    text-align: center;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 5px;

    label {
      font-size: 16px;
      font-weight: 500;
      color: #000;

      .required {
        color: #ff3a3a;
      }
    }

    input {
      padding: 12px 15px;
      border: 1px solid #d8d8d8;
      border-radius: 8px;
      font-size: 14px;
      width: 100%;
      font-family: 'Montserrat', sans-serif;

      &:focus {
        outline: none;
        border-color: #000;
      }

      &::placeholder {
        font-family: 'Montserrat', sans-serif;
        color: #999;
      }
    }

    .input-error {
      border-color: #ff3a3a;
    }

    .error-message {
      color: #ff3a3a;
      font-size: 12px;
      margin-top: 4px;
      font-family: 'Montserrat', sans-serif;
    }
  }

  &__submit {
    margin-top: 10px;
    width: 100%;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &__error {
    margin-top: 10px;
    padding: 8px;
    background-color: rgba(255, 58, 58, 0.1);
    border-radius: 8px;
    text-align: center;
  }

  &__success {
    margin-top: 10px;
    padding: 8px;
    background-color: rgba(75, 181, 67, 0.1);
    color: #4BB543;
    border-radius: 8px;
    text-align: center;
  }
}
</style>
