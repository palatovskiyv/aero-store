/**
 * Плагин для инициализации данных корзины на клиентской стороне
 * Файл с расширением .client.ts будет выполняться только на клиенте
 */
export default defineNuxtPlugin(() => {
  // Эмуляция события при инициализации клиентского приложения
  setTimeout(() => {
    // Диспетчеризуем событие cart-updated, чтобы обновить счетчик
    document.dispatchEvent(new CustomEvent('cart-updated'));
  }, 0);
}); 