<script setup lang="ts">
import { IconChevronDown, IconSearch, IconX } from '@tabler/icons-vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'

interface SelectOption {
  id: string | number
  label: string
  value: any
  iconComponent?: any
}

interface Props {
  modelValue: any
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Выберите значение',
  disabled: false,
  searchable: false,
  clearable: false,
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectedOption = ref<SelectOption | null>(null)
const searchQuery = ref('')
const selectRef = ref<HTMLElement | null>(null)

// Найти выбранный элемент при инициализации
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  updateSelectedOption()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Закрыть селект при клике вне него
function handleClickOutside(event: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

// Обновить выбранный элемент при изменении значения
function updateSelectedOption() {
  selectedOption.value = props.options.find(option => option.value === props.modelValue) || null
}

// Фильтрованные опции для поиска
const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options
  }

  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option =>
    option.label.toLowerCase().includes(query),
  )
})

// Обработчик выбора опции
function selectOption(option: SelectOption) {
  selectedOption.value = option
  emit('update:modelValue', option.value)
  isOpen.value = false
  searchQuery.value = ''
}

// Обработчик очистки
function clearSelection() {
  selectedOption.value = null
  emit('update:modelValue', null)
  searchQuery.value = ''
}

// Переключатель открытия/закрытия селекта
function toggleDropdown() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
    if (isOpen.value && props.searchable) {
      searchQuery.value = ''
    }
  }
}
</script>

<template>
  <div ref="selectRef" class="ui-select">
    <!-- Кнопка селекта -->
    <div
      class="ui-select__trigger"
      :class="{
        'ui-select__trigger--open': isOpen,
        'ui-select__trigger--disabled': disabled,
      }"
      @click="toggleDropdown"
    >
      <!-- Отображение выбранного элемента -->
      <div v-if="selectedOption" class="ui-select__selected">
        <slot name="icon" :option="selectedOption">
          <!-- Слот по умолчанию если пользовательская иконка не предоставлена -->
        </slot>
        <span class="ui-select__label">{{ selectedOption.label }}</span>
      </div>

      <!-- Плейсхолдер, если ничего не выбрано -->
      <div v-else class="ui-select__placeholder">
        {{ placeholder }}
      </div>

      <!-- Кнопки управления -->
      <div class="ui-select__actions">
        <button
          v-if="clearable && selectedOption"
          type="button"
          class="ui-select__clear"
          @click.stop="clearSelection"
        >
          <IconX size="16" stroke="1.5" />
        </button>
        <div class="ui-select__arrow" :class="{ 'ui-select__arrow--open': isOpen }">
          <IconChevronDown size="16" stroke="1.5" />
        </div>
      </div>
    </div>

    <!-- Выпадающий список -->
    <div v-if="isOpen" class="ui-select__dropdown">
      <!-- Поле поиска -->
      <div v-if="searchable" class="ui-select__search">
        <div class="ui-select__search-icon">
          <IconSearch size="16" stroke="1.5" />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск..."
          class="ui-select__search-input"
          @click.stop
        >
      </div>

      <!-- Список опций -->
      <ul class="ui-select__options">
        <li
          v-for="option in filteredOptions"
          :key="option.id"
          class="ui-select__option"
          :class="{ 'ui-select__option--selected': option.value === modelValue }"
          @click="selectOption(option)"
        >
          <slot name="icon" :option="option">
            <!-- Слот по умолчанию если пользовательская иконка не предоставлена -->
          </slot>
          <span class="ui-select__option-label">{{ option.label }}</span>
        </li>

        <!-- Сообщение, если нет результатов поиска -->
        <li v-if="searchable && filteredOptions.length === 0" class="ui-select__empty">
          Ничего не найдено
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ui-select {
  position: relative;
  width: 100%;
  user-select: none;
  font-size: 12px;

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    padding: 8px 24px;
    background-color: #D8D8D8;
    color: var(--primary-color);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
    }

    &--open {
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
    }

    &--disabled {
      opacity: 0.6;
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
  }

  &__selected,
  &__placeholder {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-grow: 1;
    overflow: hidden;
  }

  &__placeholder {
    color: #000;
  }

  &__icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  &__label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__actions {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-right: 8px;
    background: none;
    border: none;
    font-size: 12px;
    color: #999;
    cursor: pointer;

    &:hover {
      color: #f00;
    }
  }

  &__arrow {
    display: flex;
    align-items: center;
    color: #666;
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    max-height: 250px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 20px;
    padding: 12px 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    overflow: hidden;
  }

  &__search {
    position: relative;
    padding: 8px;
    border-bottom: 1px solid #eee;

    &-icon {
      position: absolute;
      top: 50%;
      left: 16px;
      transform: translateY(-50%);
      color: #666;
      display: flex;
      align-items: center;
    }

    &-input {
      width: 100%;
      padding: 8px 8px 8px 32px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #000;
      }
    }
  }

  &__options {
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 200px;
    overflow-y: auto;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f5f5f5;
    }

    &--selected {
      background-color: rgba(0, 0, 0, 0.05);
      font-weight: 500;
    }
  }

  &__option-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__empty {
    padding: 12px;
    text-align: center;
    color: #999;
  }
}
</style>
