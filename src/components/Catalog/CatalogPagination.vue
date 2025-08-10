<script setup lang="ts">
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight, IconDots } from '@tabler/icons-vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  total: number
  page?: number
  itemsPerPage?: number
  siblingCount?: number
  showEdges?: boolean
  showControls?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 16,
  siblingCount: 2,
  showEdges: true,
  showControls: true,
})

const route = useRoute()

const currentPage = computed(() => props.page || Number(route.query.page) || 1)
const pageCount = computed(() => Math.ceil(props.total / props.itemsPerPage))

function getPageRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

const paginationItems = computed(() => {
  const siblingCount = props.siblingCount
  const totalPageNumbers = siblingCount * 2 + 3 // siblings + current + first + last

  // Case 1: If the number of pages is less than the page numbers we want to show
  if (pageCount.value <= totalPageNumbers) {
    return getPageRange(1, pageCount.value).map(page => ({ type: 'page', value: page }))
  }

  const leftSiblingIndex = Math.max(currentPage.value - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage.value + siblingCount, pageCount.value)

  const shouldShowLeftDots = leftSiblingIndex > 2
  const shouldShowRightDots = rightSiblingIndex < pageCount.value - 1

  // Case 2: No left dots to show, but right dots to be shown
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount
    const leftRange = getPageRange(1, leftItemCount)

    return [
      ...leftRange.map(page => ({ type: 'page', value: page })),
      { type: 'ellipsis', value: 'ellipsis-right' },
      { type: 'page', value: pageCount.value },
    ]
  }

  // Case 3: No right dots to show, but left dots to be shown
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount
    const rightRange = getPageRange(pageCount.value - rightItemCount + 1, pageCount.value)

    return [
      { type: 'page', value: 1 },
      { type: 'ellipsis', value: 'ellipsis-left' },
      ...rightRange.map(page => ({ type: 'page', value: page })),
    ]
  }

  // Case 4: Both left and right dots to be shown
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = getPageRange(leftSiblingIndex, rightSiblingIndex)

    return [
      { type: 'page', value: 1 },
      { type: 'ellipsis', value: 'ellipsis-left' },
      ...middleRange.map(page => ({ type: 'page', value: page })),
      { type: 'ellipsis', value: 'ellipsis-right' },
      { type: 'page', value: pageCount.value },
    ]
  }

  return []
})

function getPageLink(page: number) {
  return {
    name: route.name,
    params: route.params,
    query: { ...route.query, page },
  }
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="pagination">
    <div class="pagination__list">
      <!-- First page button -->
      <NuxtLink
        v-if="showEdges"
        :to="getPageLink(1)"
        class="pagination__item"
        :class="{ 'pagination__item--disabled': currentPage <= 1 }"
        @click="scrollTop"
      >
        <IconChevronsLeft />
      </NuxtLink>

      <!-- Prev page button -->
      <NuxtLink
        :to="getPageLink(Math.max(1, currentPage - 1))"
        class="pagination__item pagination__arrow"
        :class="{ 'pagination__item--disabled': currentPage <= 1 }"
        @click="scrollTop"
      >
        <IconChevronLeft />
      </NuxtLink>

      <!-- Page numbers and ellipsis -->
      <template v-for="(item, index) in paginationItems" :key="`${item.type}-${index}`">
        <NuxtLink
          v-if="item.type === 'page'"
          :to="getPageLink(Number(item.value))"
          class="pagination__item"
          :class="{ 'pagination__item--active': item.value === currentPage }"
          @click="scrollTop"
        >
          {{ item.value }}
        </NuxtLink>

        <span
          v-else
          class="pagination__item pagination__item--empty"
        >
          <IconDots />
        </span>
      </template>

      <!-- Next page button -->
      <NuxtLink
        :to="getPageLink(Math.min(pageCount, currentPage + 1))"
        class="pagination__item pagination__arrow"
        :class="{ 'pagination__item--disabled': currentPage >= pageCount }"
        @click="scrollTop"
      >
        <IconChevronRight />
      </NuxtLink>

      <!-- Last page button -->
      <NuxtLink
        v-if="showEdges"
        :to="getPageLink(pageCount)"
        class="pagination__item"
        :class="{ 'pagination__item--disabled': currentPage >= pageCount }"
        @click="scrollTop"
      >
        <IconChevronsRight />
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pagination {
  width: 100%;
  border-top: 1px solid #7a7a7a;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__info {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
  }

  &__list {
    margin-top: 6px;
    display: flex;
    gap: 8px;

    @media (max-width: 768px) {
      gap: 4px;
    }
  }

  &__item {
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    border: 1px solid #000;
    border-radius: 5px;
    text-decoration: none;
    color: #333;
    transition: all 0.3s ease;

    @media (max-width: 768px) {
      height: 28px;
      width: 28px;
      font-size: 14px;
    }

    &--active {
      border: 1px solid #000;
      color: #fff;
      background-color: #000;
    }

    &--empty {
      border: none;
    }

    &--disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    &:hover:not(&--disabled):not(&--active) {
      background-color: #eee;
    }

    &.pagination__arrow {
      background-color: #f8f8f8;

      &:hover:not(&--disabled) {
        background-color: #e0e0e0;
      }
    }
  }
}
</style>
