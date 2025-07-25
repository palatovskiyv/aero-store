<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  type?: string
  clearable?: boolean
  icon?: any
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  type: 'text',
  clearable: false,
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const isFocused = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

// Обработчик изменения значения
function updateValue(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

// Обработчик очистки
function clearInput() {
  emit('update:modelValue', '')
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

// Обработчики фокуса
function onFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function onBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
}
</script>

<template>
  <div
    class="ui-input"
    :class="{
      'ui-input--focused': isFocused,
      'ui-input--disabled': props.disabled,
      'ui-input--with-icon': props.icon,
    }"
  >
    <!-- Поле ввода -->
    <input
      ref="inputRef"
      :value="modelValue"
      :type="props.type"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      class="ui-input__field"
      @input="updateValue"
      @focus="onFocus"
      @blur="onBlur"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
    >

    <!-- Иконка справа (если есть) -->
    <component
      :is="props.icon"
      v-if="props.icon"
      class="ui-input__icon"
      size="16"
      stroke="1.5"
    />

    <!-- Кнопка очистки (если включена) -->
    <button
      v-if="props.clearable && modelValue"
      type="button"
      class="ui-input__clear"
      @click="clearInput"
    >
      ✕
    </button>
  </div>
</template>

<style lang="scss" scoped>
.ui-input {
  width: 100%;
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 18px;
  background-color: #D8D8D8;
  color: var(--primary-color);
  border-radius: 20px;
  transition: all 0.2s ease;

  &--focused {
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
  }

  &--disabled {
    opacity: 0.6;
    background-color: #f5f5f5;
    cursor: not-allowed;
  }

  &--with-icon {
    padding-left: 24px;
  }

  &__icon {
    object-fit: contain;
  }

  &__field {
    flex: 1;
    min-width: 100px;
    height: 100%;
    padding: 0;
    border: none;
    background: transparent;
    font-size: 12px;
    font-family: 'Montserrat', sans-serif;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: #000;
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-left: 8px;
    background: none;
    border: none;
    font-size: 12px;
    color: #666;
    cursor: pointer;

    &:hover {
      color: #f00;
    }
  }
}
</style>
