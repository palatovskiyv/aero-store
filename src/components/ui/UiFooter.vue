<script>
export default {
  name: 'UiFooter',
}
</script>

<template>
  <footer class="footer">
    <div class="footer__container">
      <div class="footer__columns">
        <div class="footer__column">
          <h2 class="footer__title">
            Связь с нами
          </h2>
          <div class="footer__contacts">
            <a href="tel:+79932787007" class="footer__link">+7 (993) 278-70-07</a>
            <a href="https://t.me/aerostore_tech" class="footer__link">Telegram</a>
            <a href="https://wa.me/79932787007" class="footer__link">WhatsApp</a>
            <a href="mailto:aerostore@mail.ru" target="_blank" rel="noopener" @click="() => window.location.href = 'mailto:aerostore@mail.ru'" class="footer__link">aerostore@mail.ru</a>
          </div>
        </div>

        <div class="footer__column">
          <div class="footer__row-top">
            <NuxtLink to="/about" class="footer__title">
              О нас
            </NuxtLink>
            <NuxtLink to="/catalog" class="footer__title">
              Каталог
            </NuxtLink>
          </div>
          <div class="footer__row-bottom">
            <NuxtLink to="/policy" class="footer__info footer__info-politics underline">
              Политика конфиденциальности
            </NuxtLink>
            <h2 class="footer__info footer__info-address">
              г. Петропавловск-Камчатский, ул. Лукашевского, 5, 1 этаж, ТЦ Планета
            </h2>
          </div>
          <div class="footer__row-bottom">
            <h2 class="footer__info footer__info-text">
              Данный сайт носит исключительно информационный характер и ни при каких обстоятельствах не является публичной офертой
            </h2>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  width: 100%;
  background-color: #000;
  color: #fff;
  padding: 40px 20px;

  &__container {
    width: 100%;
    max-width: 1166px;
    margin: 0 auto;
  }

  &__columns {
    display: flex;
    justify-content: flex-start;
    gap: 106px;
  }

  &__column {
    display: flex;
    flex-direction: column;
    gap: 8px;

    @media (max-width: 1165px) {
      justify-content: center;
      align-items: center;
    }
  }

  &__row-top {
    display: flex;
    flex-direction: row;
    gap: 142px;
    margin-bottom: 12px;

    @media (max-width: 1165px) {
      display: none;
    }
  }

  &__row-bottom {
    display: flex;
    flex-direction: row;
    gap: 20px;

    @media (max-width: 1165px) {
      flex-direction: column;
      width: 100%;
      align-items: center;
      gap: 14px;
    }
  }

  &__title {
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 17px;
    color: #fff;
  }

  &__info {
    font-weight: 200;
    font-size: 10px;
    color: #fff;
  }

  &__info-address {
    @media (max-width: 1165px) {
      order: 1;
    }
  }

  &__info-politics {
    @media (max-width: 1165px) {
      order: 2;
    }
  }

  &__info-text {
    @media (max-width: 1165px) {
      text-align: center;
    }
  }

  &__contacts {
    display: flex;
    flex-direction: column;
    gap: 9px;

    @media (max-width: 1165px) {
      width: 100%;
      display: flex;
      align-items: center;
    }
  }

  &__links {
    margin-bottom: 15px;
  }

  &__link {
    color: #fff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 700;
    transition: color 0.2s;
    display: block;

    &:hover {
      color: #ccc;
    }
  }
}

@media (max-width: 1165px) {
  .footer {
    &__columns {
      flex-direction: column;
      gap: 30px;
    }
  }
}
</style>
