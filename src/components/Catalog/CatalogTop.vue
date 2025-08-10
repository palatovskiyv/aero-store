<script setup lang="ts">
import UiInput from '@/components/ui/UiInput.vue'
import UiSelect from '@/components/ui/UiSelect.vue'
import {
  IconChevronRight,
  IconClock,
  IconSortAscending,
  IconSortAscendingLetters,
  IconSortDescending,
  IconSortDescendingLetters,
  IconStar,
} from '@tabler/icons-vue'
import { computed, ref, watch } from 'vue'

// Определение props и emit событий
const props = defineProps({
  sort: {
    type: String,
    default: 'sort',
  },
})

const emit = defineEmits(['search', 'update:sort'])

// Опции для сортировки
const sortOptions = [
  { id: 0, label: 'Рекомендованные', value: 'sort', iconComponent: IconStar },
  { id: 1, label: 'Сначала новые', value: 'date-desc', iconComponent: IconClock },
  { id: 2, label: 'По цене (возрастание)', value: 'price-asc', iconComponent: IconSortAscending },
  { id: 3, label: 'По цене (убывание)', value: 'price-desc', iconComponent: IconSortDescending },
  { id: 4, label: 'По названию (возрастание)', value: 'title-asc', iconComponent: IconSortAscendingLetters },
  { id: 5, label: 'По названию (убывание)', value: 'title-desc', iconComponent: IconSortDescendingLetters },
]

// Выбранный вариант сортировки с использованием computed для v-model
const selectedSort = computed({
  get: () => props.sort,
  set: value => emit('update:sort', value),
})

// Значение поиска
const searchQuery = ref('')

// Отслеживание изменений поискового запроса
watch(searchQuery, (newValue) => {
  emit('search', newValue)
})
</script>

<template>
  <div class="catalog-top">
    <h1 class="catalog-top__heading">
      КАТАЛОГ
    </h1>
    <div class="catalog-top__search">
      <UiInput
        v-model="searchQuery"
        placeholder="Поиск"
        :clearable="true"
        :icon="IconChevronRight"
      />
    </div>
    <div class="catalog-top__sort">
      <UiSelect
        v-model="selectedSort"
        :options="sortOptions"
        placeholder="Сортировка"
        :clearable="true"
      >
        <template #icon="{ option }">
          <component
            :is="option.iconComponent"
            v-if="option.iconComponent"
            class="ui-select__icon"
            size="20"
            stroke="1.5"
          />
        </template>
      </UiSelect>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.catalog-top {
    height: 42px;
    display: flex;
    gap: 16px;
    align-items: center;

    @media (max-width: 1165px) {
      width: 100%;
      flex-direction: column;
      height: 100%;
    }

    &__heading {
        margin-right: auto;
        font-size: 32px;
        font-weight: 700;
    }

    &__search {
      width: 240px;

      @media (max-width: 1165px) {
        width: 100%;
      }
    }

    &__sort {
      width: 240px;

      @media (max-width: 1165px) {
        width: 100%;
      }
    }
}
</style>
