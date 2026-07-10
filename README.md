# Ломбард — Система управления залогами

## Запуск проекта

### С помощью Docker (рекомендуемый способ)

Перед первым запуском убедитесь, что у вас установлен Docker и Docker Compose.

**1. Управление контейнерами:**
```bash
docker compose up -d          # Запустить все сервисы в фоновом режиме
docker compose down           # Остановить и удалить контейнеры, сети и тома
docker compose logs -f app    # Просмотр логов приложения в реальном времени
docker compose exec app bash  # Войти в терминал контейнера приложения
```

**2. Работа с базой данных и миграциями:**
```bash
docker compose exec app npm install                  # Установить зависимости внутри контейнера
docker compose exec app npx typeorm migration:run     # Применить все новые миграции
docker compose exec app npx typeorm migration:revert  # Откатить последнюю примененную миграцию
```
