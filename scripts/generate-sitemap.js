import { createDirectus, rest, readItems } from '@directus/sdk'
import fs from 'fs'
import path from 'path'

// Функция транслитерации кириллицы в латиницу
function transliterate(text) {
  const transliterationMap = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
    у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y',
    ь: '', э: 'e', ю: 'yu', я: 'ya',
    А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Е: 'E', Ё: 'E', Ж: 'Zh', З: 'Z', И: 'I',
    Й: 'Y', К: 'K', Л: 'L', М: 'M', Н: 'N', О: 'O', П: 'P', Р: 'R', С: 'S', Т: 'T',
    У: 'U', Ф: 'F', Х: 'H', Ц: 'Ts', Ч: 'Ch', Ш: 'Sh', Щ: 'Sch', Ъ: '', Ы: 'Y',
    Ь: '', Э: 'E', Ю: 'Yu', Я: 'Ya'
  }
  return text.split('').map(char => transliterationMap[char] || char).join('')
}

// Создание URL-дружественного слага
function slugify(text) {
  return transliterate(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Форматирование даты в ISO 8601
function formatDate(dateString) {
  if (!dateString) return new Date().toISOString()
  return new Date(dateString).toISOString()
}

async function generateSitemap() {
  console.log('🚀 Начинаем генерацию sitemap.xml...')
  
  try {
    // Создаем клиент Directus
    const directus = createDirectus('https://api.aerostore.tech').with(rest({ credentials: 'include' }))
    
    console.log('📡 Подключаемся к Directus API...')
    
    // Получаем все опубликованные товары
    console.log('📦 Получаем товары...')
    const products = await directus.request(readItems('products', {
      filter: { status: { _eq: 'published' } },
      fields: ['id', 'title', 'date_updated'],
      limit: -1
    }))
    
    console.log(`✅ Найдено товаров: ${products.length}`)
    
    // Получаем типы товаров
    console.log('🏷️ Получаем типы товаров...')
    const types = await directus.request(readItems('types', {
      fields: ['id', 'title', 'date_updated'],
      limit: -1
    }))
    
    console.log(`✅ Найдено типов: ${types.length}`)
    
    // Получаем модели товаров
    console.log('🔧 Получаем модели товаров...')
    const models = await directus.request(readItems('models', {
      fields: ['id', 'title', 'date_updated'],
      limit: -1
    }))
    
    console.log(`✅ Найдено моделей: ${models.length}`)

    // Генерируем XML sitemap
    console.log('🔨 Генерируем XML...')
    const baseUrl = 'https://aerostore.tech'
    const currentDate = new Date().toISOString()
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Главная страница -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Каталог -->
  <url>
    <loc>${baseUrl}/catalog</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- О нас -->
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Политика конфиденциальности -->
  <url>
    <loc>${baseUrl}/policy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`

    // Добавляем товары
    console.log('📋 Добавляем товары в sitemap...')
    products.forEach((product) => {
      const slug = `${slugify(product.title)}-${product.id}`
      const lastmod = formatDate(product.date_updated)
      sitemap += `
  <url>
    <loc>${baseUrl}/product/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    })

    // Добавляем типы товаров
    console.log('🏷️ Добавляем типы товаров в sitemap...')
    types.forEach((type) => {
      const slug = `${slugify(type.title)}-${type.id}`
      const lastmod = formatDate(type.date_updated)
      sitemap += `
  <url>
    <loc>${baseUrl}/type/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    })

    // Добавляем модели товаров
    console.log('🔧 Добавляем модели товаров в sitemap...')
    models.forEach((model) => {
      const slug = `${slugify(model.title)}-${model.id}`
      const lastmod = formatDate(model.date_updated)
      sitemap += `
  <url>
    <loc>${baseUrl}/model/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    })

    sitemap += `
</urlset>`

    // Создаем директорию если её нет
    const publicDir = path.join(process.cwd(), 'src/public')
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }

    // Записываем sitemap в файл
    const sitemapPath = path.join(publicDir, 'sitemap.xml')
    fs.writeFileSync(sitemapPath, sitemap, 'utf8')
    
    const totalUrls = 4 + products.length + types.length + models.length
    
    console.log('\n🎉 Sitemap успешно сгенерирован!')
    console.log(`📁 Файл сохранен: ${sitemapPath}`)
    console.log(`📊 Общее количество URL: ${totalUrls}`)
    console.log(`   └── Статические страницы: 4`)
    console.log(`   └── Товары: ${products.length}`)
    console.log(`   └── Типы: ${types.length}`)
    console.log(`   └── Модели: ${models.length}`)
    console.log(`\n🌐 Sitemap доступен по адресу: https://aerostore.tech/sitemap.xml`)

  } catch (error) {
    console.error('\n❌ Ошибка при генерации sitemap:')
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Не удается подключиться к Directus API')
      console.error('   Проверьте доступность https://api.aerostore.tech')
    } else if (error.message?.includes('Unauthorized')) {
      console.error('🔐 Ошибка авторизации в Directus')
      console.error('   Проверьте настройки доступа к API')
    } else {
      console.error('📝 Детали ошибки:', error.message)
    }
    
    process.exit(1)
  }
}

// Запускаем генерацию
generateSitemap()
