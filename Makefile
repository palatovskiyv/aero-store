.PHONY: db-shell db-run db-seed db-backup db-restore db-restore-file

# Переменные
DB_CONTAINER = $$(docker-compose ps -q database)
DB_NAME = directus
DB_USER = directus
BACKUP_DIR = ./backups
TIMESTAMP = $$(date +"%Y%m%d_%H%M%S")
LATEST_BACKUP = $$(find $(BACKUP_DIR) -name "*.dump" -type f -printf "%T@ %p\n" | sort -nr | head -1 | cut -d' ' -f2-)

# Запуск dev
start-dev:
	docker compose up -d --build

# Запуск prod
start-prod:
	docker compose up -d --build

# Создает бэкап базы данных
db-backup:
	@mkdir -p $(BACKUP_DIR)
	@echo "Создание бэкапа базы данных..."
	docker exec -i $(DB_CONTAINER) pg_dump -U $(DB_USER) -d $(DB_NAME) -F c > $(BACKUP_DIR)/backup_$(TIMESTAMP).dump
	@echo "Бэкап сохранен в $(BACKUP_DIR)/backup_$(TIMESTAMP).dump"
	@ln -sf backup_$(TIMESTAMP).dump $(BACKUP_DIR)/latest.dump
	@echo "Ссылка на последний бэкап обновлена в $(BACKUP_DIR)/latest.dump"

# Восстанавливает базу данных из последнего бэкапа
db-restore:
	@if [ -f "$(LATEST_BACKUP)" ]; then \
		echo "Восстановление базы данных из $(LATEST_BACKUP)..."; \
		docker exec -i $(DB_CONTAINER) pg_restore -U $(DB_USER) -d $(DB_NAME) --clean --if-exists < $(LATEST_BACKUP); \
		echo "База данных восстановлена из $(LATEST_BACKUP)"; \
	else \
		echo "Ошибка: Бэкап не найден в директории $(BACKUP_DIR)"; \
		exit 1; \
	fi

# Восстанавливает базу данных из указанного бэкапа
db-restore-file:
	@read -p "Введите путь к файлу бэкапа: " backup_file; \
	echo "Восстановление базы данных из $$backup_file..."; \
	docker exec -i $(DB_CONTAINER) pg_restore -U $(DB_USER) -d $(DB_NAME) --clean --if-exists < $$backup_file; \
	echo "База данных восстановлена из $$backup_file" 