<script setup>
const { params } = useRoute()
</script>

<template>
  <Catalog :type-id="params.id" />
</template>
