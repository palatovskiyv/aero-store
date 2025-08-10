import { createDirectus, createItem, readItems, rest, staticToken, updateItem } from '@directus/sdk'
import nodemailer from 'nodemailer'

interface OrderItem {
  productId: string
  quantity: number
}

interface CreateOrderBody {
  name?: string
  phone?: string
  email?: string
  city?: string
  notes?: string
  items: OrderItem[]
  ad_source?: string
  utm?: Record<string, string>
}

export default defineEventHandler(async (event) => {
  // Создаем Directus клиент с API ключом
  const directus = createDirectus('https://api.aerostore.tech')
    .with(staticToken('xTmNE-_mQMcDh1N-lirazlqEJhWPeU0O'))
    .with(rest())

  const body = await readBody<CreateOrderBody & { utm?: Record<string, string> }>(event)

  // Получаем utm-метки
  const utm = body.utm || {}
  console.log('UTM метки:', utm) // Логируем для отладки
  // Получаем IP, user-agent, referer
  const req = event.node.req
  const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || ''
  const userAgent = req.headers['user-agent'] || ''
  const referer = req.headers['referer'] || ''

  try {
    // 1. Создаем заказ
    const order = await directus.request(
      createItem('orders', {
        name: body.name || '',
        phone: body.phone || '',
        email: body.email || '',
        city: body.city || '',
        notes: body.notes || '',
        ad_source: body.ad_source || '',
        amount: 0, // Временно устанавливаем 0, обновим после подсчета
      }),
    )

    // 2. Получаем все товары одним запросом
    const productIds = body.items.map(item => item.productId)
    const products = await directus.request(
      readItems('products', {
        filter: {
          id: {
            _in: productIds,
          },
        },
        fields: ['id', 'title', 'price', 'discount_price'],
      }),
    )

    // Создаем Map для быстрого поиска товаров по ID
    const productsMap = new Map(products.map(product => [product.id, product]))

    // 3. Добавляем товары в заказ и считаем общую стоимость
    let totalAmount = 0

    await Promise.all(
      body.items.map(async (item) => {
        const product = productsMap.get(item.productId)

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`)
        }

        const itemTotal = Number(product.discount_price || product.price) * Number(item.quantity)
        totalAmount += itemTotal

        return directus.request(
          createItem('order_items', {
            order: order.id,
            product: item.productId,
            quantity: item.quantity,
            price: product.discount_price || product.price,
          }),
        )
      }),
    )

    // 4. Обновляем заказ с правильной общей стоимостью
    await directus.request(
      updateItem('orders', order.id, {
        amount: totalAmount,
      }),
    )

    // 5. Отправляем письмо с деталями заказа
    // Настройте SMTP-транспорт под свои данные
    const transporter = nodemailer.createTransport({
      host: 'smtp.yandex.ru', // Замените на ваш SMTP сервер
      port: 587, // или 587
      secure: false, // true для 465, false для других портов
      auth: {
        user: 'aero.store@yandex.ru',
        pass: 'zonvoyrjbijjvlvy',
      },
    })

    // Формируем текст письма
    const orderItemsText = body.items.map((item) => {
      const product = productsMap.get(item.productId)
      return `- ${product?.title || 'Товар'}: ${item.quantity} шт. x ${product?.discount_price || product?.price}₽`
    }).join('\n')

    const mailOptions = {
      from: 'aero.store@yandex.ru', // От кого
      to: 'aero.store@yandex.ru', // Кому (замените на нужный адрес)
      subject: `Новый заказ #${order.id}`,
      text:
        `Поступил новый заказ:\n\n` +
        `Имя: ${body.name}\n` +
        `Телефон: ${body.phone}\n` +
        `Email: ${body.email}\n` +
        `Город: ${body.city}\n` +
        `Комментарий: ${body.notes}\n` +
        `Рекламный источник: ${body.ad_source || 'Прямой переход'}\n` +
        `\nUTM-метки:` +
        `\nutm_campaign: ${utm.utm_campaign || ''}` +
        `\nutm_source: ${utm.utm_source || ''}` +
        `\nutm_medium: ${utm.utm_medium || ''}` +
        `\nutm_term: ${utm.utm_term || ''}` +
        `\nutm_content: ${utm.utm_content || ''}` +
        `\n\nБраузер: ${userAgent}` +
        `\nIP: ${ip}` +
        `\nReferer: ${referer}` +
        `\n\nТовары:\n${orderItemsText}\n\nСумма заказа: ${totalAmount}₽`,
    }

    // Отправляем письмо
    await transporter.sendMail(mailOptions)

    return {
      success: true,
      orderId: order.id,
      totalAmount,
    }
  }
  catch (error) {
    console.error('Order creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Order creation failed',
    })
  }
})