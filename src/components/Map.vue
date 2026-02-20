<template>
  <div class="map-container">
    <div id="map" class="map-element"></div>
    <div v-if="mapError" class="map-error">
      Не удалось загрузить карту. Пожалуйста, проверьте соединение с интернетом.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const mapError = ref(false);

// Координаты точек на карте
const mainCoordinates = [53.058975, 158.634161];

// Инициализация карты
const initMap = () => {
  // Проверяем, загружен ли API Яндекс Карт
  if (typeof ymaps === 'undefined') {
    mapError.value = true;
    console.error('Ошибка загрузки API Яндекс Карт');
    return;
  }

  ymaps.ready(() => {
    try {
      // Создаем карту
      const map = new ymaps.Map('map', {
        center: mainCoordinates,
        zoom: 13,
        controls: ['zoomControl', 'fullscreenControl']
      });

      // Применяем фильтр серого цвета к карте
      map.panes.get('ground').getElement().style.filter = 'grayscale(100%)';

      // Добавляем первую метку
      const mainPlacemark = new ymaps.Placemark(mainCoordinates, {
        hintContent: 'Основная метка'
      }, {
        preset: 'islands#redDotIcon'
      });
      map.geoObjects.add(mainPlacemark);
    } catch (error) {
      console.error('Ошибка при инициализации карты:', error);
      mapError.value = true;
    }
  });
};

// Функция загрузки JavaScript API Яндекс Карт
const loadYandexMapsScript = () => {
    const apiKey = '49f28af0-9bf6-49fc-b4f4-d2aaca24743d'
    const theme = 'dark'
    const size = '450,450'

  return new Promise((resolve, reject) => {
    // Проверяем, возможно скрипт уже загружен
    if (window.ymaps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&theme=${theme}&size=${size}&lang=ru_RU`;
    script.async = true;
    script.onerror = () => {
      mapError.value = true;
      reject(new Error('Не удалось загрузить API Яндекс Карт'));
    };
    script.onload = resolve;
    document.head.appendChild(script);
  });
};

onMounted(async () => {
  try {
    await loadYandexMapsScript();
    initMap();
  } catch (error) {
    console.error('Ошибка загрузки карты:', error);
    mapError.value = true;
  }
});
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  height: 290px;
  overflow: hidden;
  border-radius: 10px;
  border: 2px solid #000;
}

.map-element {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}

.map-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(245, 245, 245, 0.9);
  text-align: center;
  padding: 20px;
  color: #ff3333;
  font-weight: 500;
}
</style>