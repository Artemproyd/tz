# Запуск проекта

## 1. Клонирование репозитория  
```bash
git clone <URL_репозитория>
cd <название_папки>
2. Создание .env файла
Создайте в корневой папке файл .env и вставьте туда:

ini
POSTGRES_DB=kittygram
POSTGRES_USER=kittygram_user
POSTGRES_PASSWORD=kittygram_password
DB_PORT=5432
DB_HOST=db

STRIPE_SECRET_KEY=секретный_ключ
STRIPE_PUBLIC_KEY=публичный_ключ
REACT_APP_STRIPE_PUBLIC_KEY=публичный_ключ

DJANGO_SECRET_KEY=django-insecure-ключ
3. Запуск проекта
bash
Копировать
Редактировать
docker-compose up --build -d
4. Настройка внутри контейнера
bash
Копировать
Редактировать
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic --noinput
