import type { DirectusClient } from '@directus/sdk'

// Типы для коллекций Directus
export interface Orders {
  id: string
  status: string
  name: string
  phone: string
  email: string
  city: string
  notes: string
  ad_source: string
  amount: number
  created_at: string
}

export interface OrderItems {
  id: string
  order: string
  product: string
  quantity: number
  price: number
}

export interface Products {
  id: string
  title: string
  description: string
  price: number
  discount_price?: number
  status: string
  images?: Array<{ directus_files_id: string }>
}

export interface Feedback {
  id: string
  name: string
  phone: string
  type: string
  status: string
  date_created: string
}

// Расширяем контекст события
declare module 'h3' {
  interface H3EventContext {
    directus: DirectusClient<any>
  }
}
