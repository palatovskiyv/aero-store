# Aero Store

Проект на основе Nuxt. Подробнее о Nuxt можно узнать в [официальной документации](https://nuxt.com/docs/getting-started/introduction).

## Запуск в production-режиме

Для запуска проекта в production-режиме выполните следующие шаги:

1. Убедитесь, что файл `.env` настроен с необходимыми переменными окружения (можно использовать `.env.example` как шаблон).

2. Запустите проект с помощью docker-compose:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. После запуска сервисы будут доступны по следующим адресам:
   - Frontend: http://localhost:80
   - Directus API: http://localhost:8055

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
