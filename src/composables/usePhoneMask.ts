import { ref } from 'vue'

export function usePhoneMask() {
  const phone = ref<string>('')
  const formattedPhone = ref<string>('')

  // Функция для применения маски к номеру телефона
  const applyPhoneMask = (value: string): { phoneDigits: string; formattedPhone: string } => {
    // Если пользователь вводит "+" в начале, мы обрабатываем это как попытку ввода кода страны
    // и пропускаем этот символ, предполагая, что мы всегда используем +7
    if (value.startsWith('+')) {
      value = value.substring(1)
    }
    
    // Удаляем все нецифровые символы
    let digits = value.replace(/\D/g, '')
    
    // Если строка начинается с 7 или 8, это, вероятно, код страны - удаляем его
    if (digits.startsWith('7') || digits.startsWith('8')) {
      digits = digits.substring(1)
    }
    
    // Ограничиваем до 10 цифр (без кода страны)
    const truncated = digits.substring(0, 10)
    
    // Устанавливаем исходное значение (только цифры)
    phone.value = truncated
    
    // Если строка пуста, возвращаем пустую строку без маски
    if (truncated.length === 0) {
      formattedPhone.value = ''
      return {
        phoneDigits: '',
        formattedPhone: ''
      }
    }
    
    // Форматируем номер телефона в формат +7 (XXX) XX XX
    let result = '+7'
    
    // Добавляем открывающую скобку и первые цифры (до 3)
    if (truncated.length > 0) {
      result += ' (' + truncated.substring(0, Math.min(3, truncated.length))
    }
    
    // Добавляем закрывающую скобку и следующие цифры (до 2)
    if (truncated.length > 3) {
      result += ') ' + truncated.substring(3, Math.min(5, truncated.length))
    }
    
    // Добавляем следующие цифры (до 2)
    if (truncated.length > 5) {
      result += ' ' + truncated.substring(5, Math.min(7, truncated.length))
    }
    
    // Добавляем последние цифры (до 3)
    if (truncated.length > 7) {
      result += ' ' + truncated.substring(7, 10)
    }
    
    // Сохраняем форматированный номер
    formattedPhone.value = result
    
    return {
      phoneDigits: truncated,
      formattedPhone: result
    }
  }
  
  // Функция-обработчик для input события
  const handlePhoneInput = (event: Event): string => {
    const inputElement = event.target as HTMLInputElement
    
    // Сохраняем текущую позицию курсора
    const selectionStart = inputElement.selectionStart || 0
    
    // Текущее значение поля
    const currentValue = inputElement.value
    
    // Предыдущее форматированное значение
    const prevFormatted = formattedPhone.value
    
    // Применяем маску
    const result = applyPhoneMask(currentValue)
    
    // Проверяем, было ли удаление символов
    const isDeleting = currentValue.length < prevFormatted.length && 
                        selectionStart < prevFormatted.length
    
    // Устанавливаем новое форматированное значение
    inputElement.value = result.formattedPhone
    
    // Пытаемся восстановить правильную позицию курсора
    if (result.formattedPhone) {
      // Рассчитываем новую позицию курсора
      let newPosition = selectionStart
      
      // Корректируем позицию курсора при удалении символов
      if (isDeleting) {
        // Если удаляется форматирующий символ, смещаем курсор назад
        if (selectionStart > 0 && /[^0-9]/.test(prevFormatted.charAt(selectionStart - 1))) {
          newPosition -= 1
        }
      } 
      // Корректируем позицию курсора при добавлении символов
      else if (result.formattedPhone.length > currentValue.length) {
        // Если добавлен форматирующий символ, смещаем курсор вперед
        const charsAdded = result.formattedPhone.length - (prevFormatted.length || 0)
        newPosition += charsAdded
      }
      
      // Устанавливаем позицию курсора
      setTimeout(() => {
        inputElement.setSelectionRange(newPosition, newPosition)
      }, 0)
    }
    
    return result.phoneDigits
  }
  
  // Функция для установки номера программно
  const setPhone = (value: string): void => {
    const result = applyPhoneMask(value)
    phone.value = result.phoneDigits
    formattedPhone.value = result.formattedPhone
  }
  
  // Функция для очистки номера телефона
  const clearPhone = (): void => {
    phone.value = ''
    formattedPhone.value = ''
  }
  
  return {
    phone,
    formattedPhone,
    handlePhoneInput,
    setPhone,
    clearPhone
  }
}