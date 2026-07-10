# Ломбард - Система управления залогами

## Запуск проекта

docker-compose up -d          # запустить
docker-compose down           # остановить
docker-compose logs -f app    # логи приложения
docker-compose exec app bash  # зайти в контейнер

# Ручной запуск миграций
docker-compose exec app npx typeorm migration:run
docker-compose exec app npx typeorm migration:revert