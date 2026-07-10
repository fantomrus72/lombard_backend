# Ломбард Пионер — Backend API

Система управления залогами. Разработано на NestJS с использованием TypeORM и PostgreSQL.

## Запуск проекта

### С помощью Docker (рекомендуемый способ)

Перед запуском убедитесь, что у вас установлен Docker и Docker Compose.

**1. Управление контейнерами:**
```bash
docker compose up -d          # Запустить все сервисы в фоновом режиме
docker compose down           # Остановить и удалить контейнеры, сети и тома
docker compose logs -f app    # Просмотр логов приложения в реальном времени
docker compose exec app bash  # Войти в терминал контейнера приложения
```

**2. База данных, миграции и сиды:**
```bash
docker compose exec app npm run migration:run     # Применить все новые миграции
docker compose exec app npm run migration:revert  # Откатить последнюю миграцию
docker compose exec app npm run seed              # Заполнить БД начальными данными (сиды)
```

### Локальный запуск (без Docker)

Для локального запуска необходим Node.js и развернутая база данных PostgreSQL.

**1. Установка зависимостей:**
```bash
npm install
```

**2. Запуск приложения:**
```bash
npm run start:dev   # Режим разработки с автоперезапуском (watch mode)
npm run start:debug # Режим отладки
npm run start:prod  # Продакшн режим (требуется предварительный npm run build)
```

## Тестирование и линтинг

```bash
npm run lint        # Проверить и автоматически исправить ошибки стиля кода
npm run format      # Форматирование кода через Prettier
npm run test        # Запуск юнит-тестов
npm run test:e2e    # Запуск end-to-end тестов
```
