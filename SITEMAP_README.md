# 📋 Генерация Sitemap для Aero Store

## 🚀 Быстрый старт

### Генерация sitemap
```bash
npm run sitemap
```

### Сборка с sitemap
```bash
npm run build:prod
```

## 📊 Результат
После запуска команды будет создан файл `src/public/sitemap.xml` содержащий:

- **4 статические страницы** (главная, каталог, о нас, политика)
- **159 товаров** из Directus
- **4 типа товаров** 
- **23 модели товаров**

**Общее количество URL: 190**

## 🔗 Доступ к sitemap
- **Локально**: `http://localhost:3000/sitemap.xml`
- **Продакшн**: `https://aerostore.tech/sitemap.xml`

## ⚙️ Особенности

### Автоматическая транслитерация
Кириллические названия товаров транслитерируются для SEO:
```
"Квадрокоптер DJI Mavic 3T" → "kvadrokopter-dji-mavic-3t-63"
```

### Приоритеты и частота обновления
- **Главная**: приоритет 1.0, обновление daily
- **Каталог**: приоритет 0.9, обновление daily  
- **Товары**: приоритет 0.8, обновление weekly
- **Типы/Модели**: приоритет 0.6, обновление weekly
- **Статические**: приоритет 0.5-0.7, обновление monthly

### Фильтрация товаров
Включаются только товары со статусом `published` из Directus.

## 🔄 Автоматизация

### GitHub Actions
Добавьте в workflow:
```yaml
- run: npm run build:prod
```

### Cron задача
```bash
# Каждую ночь в 2:00
0 2 * * * cd /path/to/project && npm run sitemap
```

## 📝 Уведомление поисковых систем

После обновления sitemap отправьте ping:
- **Google**: `https://google.com/ping?sitemap=https://aerostore.tech/sitemap.xml`
- **Яндекс**: через Яндекс.Вебмастер

## 🔧 Техническая информация

**Создан**: статический скрипт `scripts/generate-sitemap.js`  
**API**: подключение к `https://api.aerostore.tech`  
**Коллекции**: `products`, `types`, `models`  
**Robots.txt**: обновлен с ссылкой на sitemap
