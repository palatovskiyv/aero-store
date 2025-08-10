<script setup lang="ts">
import { useHead } from '#imports'
import { useCart } from '@/composables/useCart'
import { slugify } from '@/utils/translit'
import { aggregate } from '@directus/sdk'
import { useRoute } from 'vue-router'

// Props
const props = defineProps<Props>()

// Установка meta viewport для предотвращения масштабирования на мобильных устройствах
useHead({
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    },
  ],
})

interface Props {
  typeId?: string
  modelId?: string
}

interface Model {
  id: number | string
  title: string
}

interface ProductType {
  id: number | string
  title: string
  models: Model[]
}

interface ProductsCount {
  count: number
}

interface ProductFilters {
  status: {
    _eq: string
  }
  model?: {
    _eq?: string | number
    _in?: (string | number)[]
  }
  title?: {
    _icontains?: string
  }
}

// constants
const itemsPerPage = 15

// Composables
const { $directus, $readItems } = useNuxtApp()

// Computed
const selectedTypeId = computed(() => props.typeId?.split('-')?.at(-1))
const selectedModelId = computed(() => props.modelId?.split('-')?.at(-1))

// Data fetching
const { data: productTypes } = await useAsyncData<ProductType[]>('types', async () => {
  const response = await $directus.request($readItems('types', {
    fields: ['*', 'models.*'],
    sort: ['sort'],
  }))
  return response as ProductType[]
})

// Computed filters
const filteredTypes = computed(() => {
  const types = productTypes.value || []
  // if (selectedModelId.value) {
  //   return types.filter((typeItem: ProductType) =>
  //     typeItem.models?.some((model: Model) => String(model.id) === selectedModelId.value),
  //   )
  // }
  return types
})

const availableModelIds = computed(() => {
  const types = productTypes.value || []
  if (selectedModelId.value) {
    const selectedType = types.find((typeItem: ProductType) =>
      typeItem.models?.some((model: Model) => String(model.id) === selectedModelId.value),
    )
    return selectedType?.models.map((model: Model) => model.id) || []
  }
  if (selectedTypeId.value) {
    const selectedType = types.find((typeItem: ProductType) => String(typeItem?.id) === selectedTypeId.value)
    return selectedType?.models.map((model: Model) => model.id) || []
  }
  return types[0]?.models.map((model: Model) => model.id) || []
})

// Pagination
const route = useRoute()
const currentPage = computed(() => Number(route.query.page) || 1)

// Search and Sort
const searchQuery = ref('')
const sortOption = ref('sort')

function handleSearch(query: string) {
  searchQuery.value = query
}

function handleSort(option: string) {
  sortOption.value = option
}

// Products fetching
const productsFilters = computed(() => {
  const filters: ProductFilters = {
    status: { _eq: 'published' },
  }
  // Добавляем поиск по названию, если есть поисковый запрос
  if (searchQuery.value) {
    filters.title = { _icontains: searchQuery.value }
  }
  else {
    if (selectedModelId.value) {
      filters.model = { _eq: selectedModelId.value }
    }
    else if (selectedTypeId.value) {
      filters.model = { _in: availableModelIds.value }
    }
  }

  return filters
})

// Вычисляемое свойство для параметров сортировки
const sortParams = computed(() => {
  switch (sortOption.value) {
    case 'sort':
      return ['sort']
    case 'price-asc':
      return ['price']
    case 'price-desc':
      return ['-price']
    case 'title-asc':
      return ['title']
    case 'title-desc':
      return ['-title']
    case 'date-desc':
      return ['-date_created']
    default:
      return ['sort']
  }
})

const { data: products } = await useAsyncData(
  `products-${currentPage.value}-${searchQuery.value}-${sortOption.value}-${selectedTypeId.value}-${selectedModelId.value}`,
  () => {
    return $directus.request($readItems('products', {
      filter: productsFilters.value,
      sort: sortParams.value,
      limit: itemsPerPage,
      page: currentPage.value,
      fields: ['*', 'images.*'],
    }))
  },
  { watch: [currentPage, searchQuery, sortOption, productsFilters, selectedTypeId, selectedModelId] },
)

const { data: totalProductsCount } = await useAsyncData<ProductsCount>(
  `totalProductsCount-${searchQuery.value}-${sortOption.value}-${selectedTypeId.value}-${selectedModelId.value}`,
  async () => {
    const response = await $directus.request(aggregate('products', {
      query: { filter: productsFilters.value },
      aggregate: { count: '*' },
    }))
    return { count: Number(response[0]?.count) || 0 }
  },
  { watch: [currentPage, searchQuery, sortOption, productsFilters, selectedTypeId, selectedModelId] },
)

// Cart functionality
const { getCartItemsCount } = useCart()

// Notification for cart updates
const showCartNotification = ref(false)
const cartItemsCount = ref(0)

// Update cart count
function updateCartCount() {
  cartItemsCount.value = getCartItemsCount()
  showCartNotification.value = true

  // Hide notification after 3 seconds
  setTimeout(() => {
    showCartNotification.value = false
  }, 3000)
}

// Stop event propagation
function stopEvent(event: Event) {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
}

useSeoMeta({
  title: 'РЭБ системы, подавители дронов и Спутниковая система Starlink',
  description: 'Купить РЭБ «Капюшон», «Герань», «Ромашка», портативные и автомобильные комплексы подавления БПЛА. Starlink, аксессуары и защита от дронов'
})
</script>

<template>
  <div class="catalog">
    <div class="catalog__top">
      <CatalogTop v-model:sort="sortOption" @search="handleSearch" @update:sort="handleSort" />
    </div>
    <aside class="catalog__aside">
      <div>
        <NuxtLink
          active-class="catalog__type--active"
          class="catalog__type catalog__type--all"
          to="/catalog"
        >
          Весь каталог
        </NuxtLink>
      </div>
      <template v-for="type in filteredTypes" :key="type.id">
        <div>
          <NuxtLink
            active-class="catalog__type--active"
            class="catalog__type"
            :to="{ name: 'type-id', params: { id: `${slugify(type.title)}-${type.id}` } }"
          >
            {{ type.title }}
          </NuxtLink>
        </div>
        <template v-for="model in type.models" :key="model.id">
          <div>
            <NuxtLink
              active-class="catalog__model--active"
              class="catalog__model"
              :to="{ name: 'model-id', params: { id: `${slugify(model.title)}-${model.id}` } }"
            >
              {{ model.title }}
            </NuxtLink>
          </div>
        </template>
      </template>
    </aside>
    <div class="catalog__list">
      <div v-for="item in products" :key="item.id" class="catalog__item-wrapper">
        <div class="catalog__item-container">
          <NuxtLink
            class="catalog__item-link"
            :to="{ name: 'product-id', params: { id: `${slugify(item.title)}-${item.id}` } }"
          >
            <CatalogItem
              :id="item.id"
              :title="item.title"
              :description="item.description"
              :price="item.price"
              :discount-price="item.discount_price"
              :images="item.images"
              button-text="Купить"
              @cart-updated="updateCartCount"
              @button-click="stopEvent"
            />
          </NuxtLink>
        </div>
      </div>
    </div>
    <div class="catalog__bottom">
      <CatalogPagination :total="totalProductsCount!.count" :items-per-page="itemsPerPage" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.catalog {
  width: 1166px;
  max-width: 100%;
  min-height: 60vh;
  margin: 0 auto;
  margin-top: 142px;
  margin-bottom: 50px;
  display: grid;
  grid-template-columns: 1fr 3fr;
  align-items: start;
  gap: 16px;
  grid-template-areas:
    "t t"
    "a l"
    "a b";
  box-sizing: border-box;

  *, *::before, *::after {
    box-sizing: border-box;
  }

  @media (max-width: 1165px) {
    margin-top: 88px;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 15px;
  }

  &__top {
    margin-bottom: 14px;
    grid-area: t;

    @media (max-width: 1165px) {
      width: 100%;
    }
  }

  &__aside {
    grid-area: a;
    display: flex;
    flex-direction: column;
    gap: 8px;

    @media (max-width: 1165px) {
      display: none;
    }
  }

  &__list {
    grid-area: l;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    width: 100%;

    @media (max-width: 1165px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    @media (max-width: 480px) {
      gap: 8px;
    }
  }

  &__item-wrapper {
    position: relative;
    height: 520px;
    width: 100%;

    @media (max-width: 1165px) {
      height: 480px;
    }

    @media (max-width: 768px) {
      height: 450px;
    }

    @media (max-width: 480px) {
      height: 400px;
    }
  }

  &__item-container {
    position: relative;
    height: 100%;
    width: 100%;
  }

  &__item-link {
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
  }

  &__bottom {
    grid-area: b;
    display: flex;
    justify-content: center;

    @media (max-width: 1165px) {
      width: 100%;
    }
  }

  &__type {
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #000;
    text-decoration: none;

    &--active {
      background-color: #ddd;
    }

    &--all {
      margin-bottom: 8px;
      background-color: #f0f0f0;
      font-weight: 700;
    }
  }

  &__model {
    padding: 6px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 400;
    color: #000;
    text-decoration: none;

    &--active {
      background-color: #ddd;
    }
  }

  &__count {
    margin-top: 16px;
    font-size: 14px;
    color: #666;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
