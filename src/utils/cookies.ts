// Утилиты для работы с куками

// Установка куки
export function setCookie(name: string, value: string, days: number = 30): void {
  if (typeof window === 'undefined') return // Проверяем, что мы на клиенте
  
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  
  const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  document.cookie = cookieString
  
  console.log(`🍪 Устанавливаю cookie: ${name}=${value}`)
  console.log(`🍪 Cookie строка: ${cookieString}`)
}

// Получение куки
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null // Проверяем, что мы на клиенте
  
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  
  return null
}

// Удаление куки
export function deleteCookie(name: string): void {
  if (typeof window === 'undefined') return // Проверяем, что мы на клиенте
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

// Проверка, пришел ли пользователь с рекламы
export function isFromAds(): boolean {
  return getCookie('ad_source') !== null
}

// Получение источника рекламы
export function getAdSource(): string | null {
  return getCookie('ad_source')
}

// Сохраняем все utm-метки из URL в cookies
export function saveUtmFromUrl(): void {
  if (typeof window === 'undefined') return
  
  const params = new URLSearchParams(window.location.search)
  const utmKeys = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_term', 'utm_content']
  
  console.log('=== Сохранение UTM меток ===')
  console.log('URL параметры:', window.location.search)
  console.log('Текущий URL:', window.location.href)
  
  let savedCount = 0
  utmKeys.forEach(key => {
    const value = params.get(key)
    if (value) {
      setCookie(key, value)
      console.log(`✅ Сохранена UTM метка ${key}:`, value)
      savedCount++
    } else {
      console.log(`❌ UTM метка ${key} не найдена в URL`)
    }
  })
  
  console.log(`Всего сохранено UTM меток: ${savedCount}`)
  
  // Проверяем, что метки действительно сохранились
  setTimeout(() => {
    const savedUtm = getUtmTags()
    console.log('Проверка сохраненных UTM меток:', savedUtm)
  }, 100)
}

// Получаем все utm-метки из cookies
export function getUtmTags(): Record<string, string | null> {
  const utmKeys = ['utm_source', 'utm_campaign', 'utm_medium', 'utm_term', 'utm_content']
  const result: Record<string, string | null> = {}
  
  console.log('=== Получение UTM меток из cookies ===')
  
  utmKeys.forEach(key => {
    const value = getCookie(key)
    result[key] = value
    if (value) {
      console.log(`✅ Найдена UTM метка ${key}:`, value)
    } else {
      console.log(`❌ UTM метка ${key} не найдена в cookies`)
    }
  })
  
  console.log('Итоговые UTM метки:', result)
  return result
} 