# API для обратной связи

## Описание

Добавлен новый API endpoint для обработки обратной связи с автоматической отправкой уведомлений на email.

## Endpoint

### POST /api/feedback/create

Создает новую заявку обратной связи и отправляет уведомление на email.

#### Параметры запроса

```json
{
  "name": "Имя пользователя",
  "phone": "Номер телефона",
  "type": "callback",
  "status": "Не обработано",
  "date_created": "2024-01-01T12:00:00.000Z"
}
```

#### Параметры

- `name` (string, обязательный) - Имя пользователя
- `phone` (string, обязательный) - Номер телефона
- `type` (string, опциональный) - Тип заявки (по умолчанию: "callback")
- `status` (string, опциональный) - Статус заявки (по умолчанию: "Не обработано")
- `date_created` (string, опциональный) - Дата создания (по умолчанию: текущая дата)

#### Ответ

```json
{
  "success": true,
  "feedbackId": "uuid-заявки"
}
```

## Email уведомления

При создании заявки автоматически отправляется email на адрес `aero.store@yandex.ru` со следующими данными:

- Тема: "Новая заявка на [тип заявки] #[ID]"
- Содержание:
  - Имя пользователя
  - Номер телефона
  - Тип заявки
  - Статус
  - Дата создания
  - ID заявки

## Использование в компонентах

### Пример использования в Vue компоненте

```javascript
async function submitFeedback() {
  try {
    const response = await $fetch('/api/feedback/create', {
      method: 'POST',
      body: {
        name: 'Иван Иванов',
        phone: '9991234567',
        type: 'callback',
        status: 'Не обработано',
        date_created: new Date().toISOString(),
      },
    })

    if (response.success) {
      console.log('Заявка создана:', response.feedbackId)
    }
  } catch (error) {
    console.error('Ошибка:', error)
  }
}
```

## Настройка SMTP

Email уведомления отправляются через SMTP сервер Yandex с настройками:

- Host: smtp.yandex.ru
- Port: 587
- Secure: false
- User: aero.store@yandex.ru
- Pass: zonvoyrjbijjvlvy

## Тестирование

Для тестирования API endpoint можно использовать файл `test-feedback.js`:

```bash
node test-feedback.js
```

## Изменения в коде

1. Создан новый API endpoint: `server/api/feedback/create.post.ts`
2. Обновлен компонент `Location.vue` для использования нового endpoint
3. Добавлен интерфейс `Feedback` в `server/types/directus.ts`
4. Создан тестовый файл `test-feedback.js`

## Структура данных в Directus

Заявки обратной связи сохраняются в коллекции `orders` со следующими полями:

- `id` - уникальный идентификатор
- `name` - имя пользователя
- `phone` - номер телефона
- `email` - пустое поле (для обратной связи)
- `city` - пустое поле (для обратной связи)
- `notes` - содержит тип заявки, статус и дату создания
- `ad_source` - "Обратная связь" (для различения от заказов)
- `amount` - 0 (нет суммы для обратной связи)

## Важные замечания

- Заявки обратной связи сохраняются в той же коллекции `orders`, что и заказы
- Для различения заказов и обратной связи используется поле `ad_source`
- Подробная информация о типе заявки сохраняется в поле `notes`
- Email уведомления отправляются автоматически при создании заявки 