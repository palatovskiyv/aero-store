export default defineNuxtPlugin(() => {
  // Проверяем, что мы на клиенте
  if (process.client) {
    const route = useRoute()
    
    // Список параметров, которые указывают на рекламные источники
    const adParams = [
      'utm_source',
      'utm_medium', 
      'utm_campaign',
      'utm_content',
      'utm_term',
      'yclid', // Яндекс.Директ
      'gclid', // Google Ads
      'fbclid', // Facebook
      'msclkid', // Microsoft Ads
      'ref', // Общий параметр реферала
    ]
    
    // Проверяем, есть ли рекламные параметры в URL
    const hasAdParams = adParams.some(param => route.query[param])
    
    if (hasAdParams) {
      // Создаем объект с данными о рекламном источнике
      const adData = {
        source: route.query.utm_source || route.query.ref || 'unknown',
        medium: route.query.utm_medium || 'unknown',
        campaign: route.query.utm_campaign || 'unknown',
        content: route.query.utm_content || '',
        term: route.query.utm_term || '',
        timestamp: new Date().toISOString(),
        // Специальные параметры для разных рекламных систем
        yclid: route.query.yclid || '',
        gclid: route.query.gclid || '',
        fbclid: route.query.fbclid || '',
        msclkid: route.query.msclkid || '',
      }
      
      // Сохраняем данные в куки на 30 дней
      document.cookie = `ad_source=${encodeURIComponent(JSON.stringify(adData))};expires=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()};path=/;SameSite=Lax`
      
      console.log('Рекламный источник отслежен:', adData)
    }
  }
}) 