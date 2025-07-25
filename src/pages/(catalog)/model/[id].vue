<script setup>
const { params } = useRoute()
</script>

<template>
  <Catalog :model-id="params.id" />
</template>
