<script setup lang="ts">
const specs = ref([{ name: 'Тип товара', value: 'квадракоптер' }, { name: 'Модель', value: 'DJI Mavic 3 Pro' }])
</script>

<template>
  <UiContainer class="product-hero">
    <ProductImages :images="['image1.jpg', 'image2.jpg', 'image3.jpg']" />
    <div class="product-hero__info">
      <h1 class="product-hero__title">
        DJI Mavic 3 Pro
      </h1>
      <div v-for="spec, idx in specs" :key="idx" class="product-hero__spec product-spec">
        <span class="product-spec__name">{{ spec.name }}</span>
        <span class="product-spec__space" />
        <span class="product-spec__value">{{ spec.value }}</span>
      </div>
      <div class="product-hero__description">
        <h3 class="product-description__heading">
          Краткое описание:
        </h3>
        <p class="product-description__text">
          Новинка от DJI Mavic модель 3 PRO (DJI RC Pro) - самая продвинутая в плане съёмки версия в линейке самых производительных складных дронов DJI. Блок камер включает две телекамеры (70 мм и 166 мм) и основную камеру Hasselblad с матрицей 4/3". Время полёта — до 43 минут, дальность — до 15 км. Видео пилоту передаётся в качестве 1080р 60 кадр/с.
        </p>
      </div>
    </div>
  </UiContainer>
</template>

<style lang="scss" scoped>
.product-hero {
    margin-top: 128px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
    flex: 1;

    &__info {
        padding: 24px 48px;
        background-color: #000;
        color: #fff;
        border-radius: 24px;
    }
}

.product-spec {
    display: flex;
    align-items: center;
    line-height: 18px;
    height: 18px;
    gap: 4px;

    &__name {
        font-size: 16px;
        color: #fff;
    }

    &__space {
        border-bottom: 1px dotted #bbb;
        height: 10px;
        flex: 1;
    }

    &__value {
        color: #bbb;
    }
}
</style>
