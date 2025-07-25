import { ref } from 'vue'

export function useNameFormatter() {
  const name = ref<string>('')
  const formattedName = ref<string>('')

  // Функция для применения форматирования к имени
  const applyNameFormat = (value: string): { name: string; formattedName: string } => {
    // Удаляем все символы, кроме букв и пробелов
    const letters = value.replace(/[^а-яА-Яa-zA-Z\s]/g, '')
    
    // Форматируем имя: каждое слово с большой буквы
    const formatted = letters
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    // Сохраняем отформатированное имя
    name.value = formatted
    formattedName.value = formatted
    
    return {
      name: formatted,
      formattedName: formatted
    }
  }
  
  // Функция-обработчик для input события
  const handleNameInput = (event: Event): string => {
    const inputElement = event.target as HTMLInputElement
    
    // Сохраняем текущую позицию курсора
    const selectionStart = inputElement.selectionStart || 0
    
    // Текущее значение поля
    const currentValue = inputElement.value
    
    // Применяем форматирование
    const result = applyNameFormat(currentValue)
    
    // Устанавливаем новое форматированное значение
    inputElement.value = result.formattedName
    
    // Рассчитываем смещение курсора
    // Если длина изменилась, нужно сдвинуть курсор
    const cursorOffset = result.formattedName.length - currentValue.length
    
    // Устанавливаем позицию курсора
    setTimeout(() => {
      // Если курсор находится в начале слова, оставляем его на месте
      // Иначе учитываем изменение длины строки
      const newPosition = Math.min(
        result.formattedName.length,
        selectionStart + (cursorOffset > 0 ? 0 : cursorOffset)
      )
      inputElement.setSelectionRange(newPosition, newPosition)
    }, 0)
    
    return result.name
  }
  
  // Функция для установки имени программно
  const setName = (value: string): void => {
    const result = applyNameFormat(value)
    name.value = result.name
    formattedName.value = result.formattedName
  }
  
  // Функция для очистки имени
  const clearName = (): void => {
    name.value = ''
    formattedName.value = ''
  }
  
  return {
    name,
    formattedName,
    handleNameInput,
    setName,
    clearName
  }
} 