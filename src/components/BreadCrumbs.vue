<script lang="ts" setup>
import type { PropType } from 'vue'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

interface BreadcrumbItem {
  text: string
  to: string | { name: string } | { path: string }
}

const props = defineProps<{
  items: BreadcrumbItem[]
  separator?: string
  includeHome?: boolean
  homeText?: string
}>()

const separator = props.separator ?? '›'
const includeHome = props.includeHome ?? true
const homeText = props.homeText ?? 'Home'

const processedCrumbs = computed(() => {
  const homeCrumb = { text: homeText, to: '/' }
  return includeHome ? [homeCrumb, ...props.items] : [...props.items]
})

const isLast = (index: number) => index === processedCrumbs.value.length - 1
</script>

<template>
  <nav aria-label="Breadcrumb navigation" class="breadcrumbs">
    <ol class="breadcrumbs__list">
      <template v-for="(crumb, index) in processedCrumbs" :key="index">
        <li
          v-if="crumb.text && crumb.to"
          class="breadcrumbs__item"
          :class="{ 'breadcrumbs__item--active': isLast(index) }"
        >
          <RouterLink

            :to="crumb.to"
            class="breadcrumbs__link"
          >
            {{ crumb.text }}
          </RouterLink>
          <span
            v-if="!isLast(index)"
            class="breadcrumbs__separator"
            aria-hidden="true"
          >
            {{ separator }}
          </span>
        </li>
      </template>
    </ol>
  </nav>
</template>

  <style scoped>
  .breadcrumbs {
    font-size: 0.9rem;
    margin: 1rem 0;
  }

  .breadcrumbs__list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 0.5rem;
  }

  .breadcrumbs__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .breadcrumbs__link {
    color: #666;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .breadcrumbs__link:hover {
    color: #333;
  }

  .breadcrumbs__current {
    color: var(--primary-color);
    font-weight: 500;
  }

  .breadcrumbs__separator {
    color: #666;
  }
  </style>
