// Утилиты для работы с куками

// Установка куки
export function setCookie(name: string, value: string, days: number = 30): void {
  if (typeof window === 'undefined') return // Проверяем, что мы на клиенте
  
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
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