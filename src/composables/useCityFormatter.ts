import { ref } from 'vue'

export function useCityFormatter() {
  const city = ref<string>('')
  const formattedCity = ref<string>('')

  // Функция для применения форматирования к названию города
  const applyCityFormat = (value: string): { city: string; formattedCity: string } => {
    // Удаляем все символы, кроме букв, пробелов и дефисов
    const letters = value.replace(/[^а-яА-Яa-zA-Z\s\-]/g, '')
    
    // Форматируем название города: каждое слово с большой буквы
    const formatted = letters
      .toLowerCase()
      .split(/[\s-]+/) // Разделяем по пробелам и дефисам
      .filter(word => word.length > 0) // Фильтруем пустые слова
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    // Сохраняем отформатированное название
    city.value = formatted
    formattedCity.value = formatted
    
    return {
      city: formatted,
      formattedCity: formatted
    }
  }
  
  // Функция-обработчик для input события
  const handleCityInput = (event: Event): string => {
    const inputElement = event.target as HTMLInputElement
    
    // Сохраняем текущую позицию курсора
    const selectionStart = inputElement.selectionStart || 0
    
    // Текущее значение поля
    const currentValue = inputElement.value
    
    // Применяем форматирование
    const result = applyCityFormat(currentValue)
    
    // Устанавливаем новое форматированное значение
    inputElement.value = result.formattedCity
    
    // Рассчитываем смещение курсора
    // Если длина изменилась, нужно сдвинуть курсор
    const cursorOffset = result.formattedCity.length - currentValue.length
    
    // Устанавливаем позицию курсора
    setTimeout(() => {
      // Если курсор находится в начале слова, оставляем его на месте
      // Иначе учитываем изменение длины строки
      const newPosition = Math.min(
        result.formattedCity.length,
        selectionStart + (cursorOffset > 0 ? 0 : cursorOffset)
      )
      inputElement.setSelectionRange(newPosition, newPosition)
    }, 0)
    
    return result.city
  }
  
  // Функция для установки города программно
  const setCity = (value: string): void => {
    const result = applyCityFormat(value)
    city.value = result.city
    formattedCity.value = result.formattedCity
  }
  
  // Функция для очистки названия города
  const clearCity = (): void => {
    city.value = ''
    formattedCity.value = ''
  }
  
  return {
    city,
    formattedCity,
    handleCityInput,
    setCity,
    clearCity
  }
}