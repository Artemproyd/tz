### Как запустить проект:

Клонировать репозиторий и перейти в него в командной строке:

```
git clone https://github.com/yandex-praktikum/kittygram_backend.git
```

```
cd kittygram_backend
```

Cоздать и активировать виртуальное окружение:

```
python3 -m venv env
```

* Если у вас Linux/macOS

    ```
    source env/bin/activate
    ```

* Если у вас windows

    ```
    source env/scripts/activate
    ```

```
python3 -m pip install --upgrade pip
```

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
