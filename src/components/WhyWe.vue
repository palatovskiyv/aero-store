<script setup>
import icon1 from '@/assets/icons/why-icon1.svg';
import icon2 from '@/assets/icons/why-icon2.svg';
import icon3 from '@/assets/icons/why-icon3.svg';
import icon4 from '@/assets/icons/why-icon4.svg';

const items = [
    {
        id: 1,
        icon: icon1,
        title: 'Доставка по РФ',
        text: 'Бесплатная доставка по всей РФ. Самовывоз или экспресс-доставка по Москве и МО за час'
    },
    {
        id: 2,
        icon: icon2,
        title: 'Ассортимент',
        text: 'Большой ассортимент новых и оригинальных товаров и всех комплектующих'
    },
    {
        id: 3,
        icon: icon3,
        title: 'Гарантия',
        text: 'Весь наш товар является оригинальным, новым и запечатанным'
    },
    {
        id: 4,
        icon: icon4,
        title: 'Поддержка',
        text: 'Консультируем и помогаем со всеми возникшими у вас вопросами'
    }
]
</script>

<template>
  <div class="why-we">
    <div class="why-we__container">
      <h3 class="why-we__title">ПОЧЕМУ МЫ?</h3>
      <div class="why-we__subtitle">Ваши преимущества при работе с AeroStore</div>
      <div class="why-we__content">
        <div v-for="item in items" :key="item.id" class="content-item">
          <img class="content-item__icon" :src="item.icon" alt="icon">
          <div class="content-item__inner">
            <div class="content-item__title">{{ item.title }}</div>
            <div class="content-item__text">{{ item.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.why-we {
  width: 100%;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.7) 0 100%), url('~/assets/images/whywe.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 15px;

  &__container {
    max-width: 1166px;
    padding: 55px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__title {
    font-size: 32px;
    font-weight: 400;
    margin-bottom: 13px;

    @media (max-width: 1165px) {
      font-size: 24px;
    }
  }

  &__subtitle {
    font-size: 16px;
    margin-bottom: 59px;

    @media (max-width: 1165px) {
      font-size: 12px;
    }
  }

  &__content {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 28px;

    @media (max-width: 1165px) {
      grid-template-columns: repeat(1, 1fr);
    }
  }
}

.content-item {
  padding: 38px 58px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 30px;
  background: rgba(48, 48, 48, 0.5);
  backdrop-filter: blur(30px);
  border-radius: 25px;
  max-height: 150px;

  @media (max-width: 1165px) {
    padding: 16px 24px;
    min-height: 109px;
    gap: 24px;
  }

  &__icon {
    width: 56px;
    height: 56px;

    @media (max-width: 1165px) {
      width: 40px;
      height: 40px;
    }
  }

  &__title {
    font-family: 'Unbounded', cursive;
    font-size: 24px;
    font-weight: 400;
    margin-bottom: 12px;
    color: #fff;

    @media (max-width: 1165px) {
      font-size: 14px;
    }
  }

  &__text {
    line-height: 16px;
    font-weight: 300;
    font-size: 14px;
    color: #fff;

    @media (max-width: 1165px) {
      font-size: 12px;
    }
  }
}

</style> 