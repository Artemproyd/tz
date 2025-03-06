# Запуск проекта

## 1. Клонирование репозитория  
```
git clone https://github.com/Artemproyd/tz.git
cd tz
```
2. Создание .env файла
Создайте в корневой папке файл .env и вставьте туда:

```
POSTGRES_DB=kittygram
POSTGRES_USER=kittygram_user
POSTGRES_PASSWORD=kittygram_password
DB_PORT=5432
DB_HOST=db

STRIPE_SECRET_KEY=секретный_ключ
STRIPE_PUBLIC_KEY=публичный_ключ
REACT_APP_STRIPE_PUBLIC_KEY=публичный_ключ

DJANGO_SECRET_KEY=django-insecure-ключ
```
3. Запуск проекта
```
docker-compose up --build -d
```
4. Настройка внутри контейнера
```
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py collectstatic --noinput
```
