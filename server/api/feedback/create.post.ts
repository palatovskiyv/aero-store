import { createDirectus, createItem, rest, staticToken } from '@directus/sdk'
import nodemailer from 'nodemailer'

interface CreateFeedbackBody {
  name: string
  phone: string
  type: string
  status: string
  date_created: string
}

export default defineEventHandler(async (event) => {
  // Создаем Directus клиент с API ключом
  const directus = createDirectus('https://api.aerostore.tech')
    .with(staticToken('xTmNE-_mQMcDh1N-lirazlqEJhWPeU0O'))
    .with(rest())

  const body = await readBody<CreateFeedbackBody>(event)

  try {
    // 1. Создаем запись обратной связи в коллекции orders
    // Используем поле notes для указания типа заявки
    const feedback = await directus.request(
      createItem('orders', {
        name: body.name || '',
        phone: body.phone || '',
        email: '', // Пустое поле для обратной связи
        city: '', // Пустое поле для обратной связи
        notes: `ТИП: ${body.type || 'callback'}. Статус: ${body.status || 'Не обработано'}. Дата: ${body.date_created || new Date().toISOString()}`,
        ad_source: 'Обратная связь',
        amount: 0, // Нет суммы для обратной связи
      }),
    )

    // 2. Отправляем письмо с деталями обратной связи
    const transporter = nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 587,
      secure: false,
      auth: {
        user: 'aero.store@yandex.ru',
        pass: 'zonvoyrjbijjvlvy',
      },
    })

    // Формируем текст письма
    const feedbackTypeText = body.type === 'callback' ? 'Обратный звонок' : 'Обратная связь'
    
    const mailOptions = {
      from: 'aero.store@yandex.ru',
      to: 'aero.store@yandex.ru',
      subject: `Новая заявка на ${feedbackTypeText} #${feedback.id}`,
      text: `Поступила новая заявка на ${feedbackTypeText}:\n\nИмя: ${body.name}\nТелефон: ${body.phone}\nТип заявки: ${feedbackTypeText}\nСтатус: ${body.status}\nДата создания: ${new Date(body.date_created).toLocaleString('ru-RU')}\n\nID заявки: ${feedback.id}`,
    }

    // Отправляем письмо
    await transporter.sendMail(mailOptions)

    return {
      success: true,
      feedbackId: feedback.id,
    }
  }
  catch (error) {
    console.error('Feedback creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Feedback creation failed',
    })
  }
}) 