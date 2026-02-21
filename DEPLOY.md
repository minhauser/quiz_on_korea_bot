# Деплой Telegram Quiz Bot на Railway

Пошаговая инструкция для первого деплоя и дальнейших обновлений.

---

## 1. Подготовка репозитория

1. Создайте репозиторий на GitHub (если ещё нет) и залейте проект:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
2. **Не коммитьте** токен бота и файл `quiz_bot.db` — они уже в `.gitignore`. Токен задаётся через переменные окружения на Railway.

---

## 2. Первый деплой на Railway

### 2.1 Создание проекта

1. Зайдите на [railway.app](https://railway.app) и войдите (через GitHub удобнее).
2. **New Project** → **Deploy from GitHub repo**.
3. Выберите репозиторий с ботом и ветку (обычно `main`).
4. Railway создаст сервис и начнёт первый деплой.

### 2.2 Переменные окружения (Variables)

1. Откройте созданный сервис.
2. Вкладка **Variables** → **Add Variable** (или **RAW Editor**).
3. Добавьте:
   - `BOT_TOKEN` = токен от [@BotFather](https://t.me/BotFather) (обязательно).
   - `DB_PATH` = `/data/quiz_bot.db` — если будете использовать Volume (см. ниже). Иначе можно не задавать (по умолчанию `quiz_bot.db` в рабочей папке).

### 2.3 Start Command (команда запуска)

1. Сервис → **Settings**.
2. В блоке **Deploy** найдите **Start Command** (или **Custom Start Command**).
3. Укажите: `python bot.py`  
   (если в проекте есть `Procfile` с `worker: python bot.py`, Railway может подхватить его сам; при необходимости задайте команду вручную).

### 2.4 Сохранение базы данных (Volume)

Без тома при каждом редеплое база `quiz_bot.db` будет создаваться заново. Чтобы данные сохранялись:

1. В сервисе: **Settings** → **Volumes** → **Add Volume**.
2. Укажите **Mount Path**: `/data`.
3. В **Variables** задайте: `DB_PATH=/data/quiz_bot.db`.
4. Перезапустите сервис (Redeploy).

После этого база будет храниться в томе и не пропадёт при обновлениях.

#### Как подложить старый файл quiz_bot.db в Volume (полная инструкция)

В интерфейсе Railway **нельзя загрузить файл в Volume** вручную. Бот при первом запуске сам копирует базу из репозитория в Volume, если по пути `DB_PATH` базы ещё нет.

**Шаг 1. Положить старую базу в репозиторий**

1. Возьмите ваш старый файл `quiz_bot.db` (например, из «Загрузки» или «Telegram Desktop»).
2. В папке проекта скопируйте его **как** `db_backup/quiz_bot_backup.db` (замените существующий файл):
   ```bash
   copy "C:\Users\mamur\Downloads\Telegram Desktop\quiz_bot.db" "db_backup\quiz_bot_backup.db"
   ```
   (или перетащите файл в папку `db_backup` и назовите `quiz_bot_backup.db`).
3. Закоммитьте и запушьте в ветку `main`:
   ```bash
   git add db_backup/quiz_bot_backup.db
   git commit -m "Restore DB backup for Volume"
   git push origin main
   ```

**Шаг 2. Настроить Volume в Railway**

Volume настраивается у **сервиса**, а не в Project Settings.

1. В левой панели Railway откройте **проект** (например, earnest-prosperity), затем выберите **сервис** с ботом (например, quiz_on_korea_bot).
2. Вверху откройте вкладку **Settings** (настройки сервиса, не проекта).
3. В блоке **Volumes** нажмите **Add Volume**.
4. В поле **Mount Path** укажите: **`/data`**.
5. Сохраните (Add / Create).

**Шаг 3. Указать путь к базе в Volume**

1. В том же сервисе откройте вкладку **Variables**.
2. Добавьте или измените переменную:
   - Имя: **`DB_PATH`**
   - Значение: **`/data/quiz_bot.db`**

**Шаг 4. Запустить деплой**

1. Вкладка **Deployments** → кнопка **Redeploy** у последнего деплоя (или дождаться автодеплоя после `git push`).
2. При **первом** запуске бот увидит, что файла `/data/quiz_bot.db` нет, найдёт в репозитории `db_backup/quiz_bot_backup.db` и скопирует его в `/data/quiz_bot.db`. В логах появится строка: `restored DB from db_backup/quiz_bot_backup.db to /data/quiz_bot.db`.
3. Дальше бот всегда будет использовать `/data/quiz_bot.db` в томе; данные сохранятся между редеплоями.

**Итог:** старый `quiz_bot.db` лежит в репо как `db_backup/quiz_bot_backup.db`. Volume примонтирован в `/data`. Бот при первом запуске копирует бэкап в `/data/quiz_bot.db` и с этого момента работает с этой базой.

### 2.5 Резервная копия БД в GitHub (без Volume или дополнительно)

Если не используете Volume или хотите дублировать данные в репозитории, бот может каждые 5 минут делать бэкап `quiz_bot.db` и пушить его в репозиторий (файл `db_backup/quiz_bot_backup.db`).

1. Создайте **Personal Access Token** на GitHub: **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token**. Выдайте право **repo** (полный доступ к репозиториям).
2. В Railway в **Variables** добавьте:
   - `GITHUB_TOKEN` = созданный токен (обязательно для бэкапа в репо).
   - `GITHUB_REPOSITORY` = `ВАШ_ЛОГИН/ИМЯ_РЕПО`, например `username/quiz-tg-bot`.
3. Интервал по умолчанию — 300 секунд (5 минут). Чтобы изменить: `BACKUP_INTERVAL_SEC=600` (10 минут) и т.д.

После редеплоя или потери тома можно восстановить БД: скачайте `db_backup/quiz_bot_backup.db` из репозитория, переименуйте в `quiz_bot.db` и положите в папку с ботом (или укажите путь через `DB_PATH`).

### 2.6 Проверка

1. Вкладка **Deployments** — последний деплой должен быть в статусе **Success** (зелёный).
2. Вкладка **Logs** — в логах не должно быть ошибки про `BOT_TOKEN`; бот должен запускаться без исключений.
3. Напишите боту в Telegram — он должен отвечать.

---

## 3. Обновления бота (как обновлять в будущем)

### Вариант A: Автодеплой с GitHub (рекомендуется)

1. При первом деплое Railway уже мог подключить репозиторий.
2. Убедитесь, что в настройках сервиса включено: **Settings** → **Source** → **Deploy on push** (или аналог для автодеплоя при пуше в выбранную ветку).
3. Дальше для обновления бота:
   ```bash
   git add .
   git commit -m "Описание изменений"
   git push origin main
   ```
4. Railway сам соберёт новый образ и перезапустит сервис. Статус смотрите в **Deployments** и **Logs**.

### Вариант B: Ручной деплой через CLI

1. Установите [Railway CLI](https://docs.railway.com/guides/cli).
2. В папке проекта:
   ```bash
   railway login
   railway link   # привязать к нужному проекту/сервису
   railway up
   ```
   Обновление уйдёт в тот сервис, к которому привязан проект.

### Что не теряется при обновлении

- **Variables** (в т.ч. `BOT_TOKEN`, `DB_PATH`) хранятся в Railway и не зависят от кода.
- **Volume** с путём `/data` и файлом `quiz_bot.db` сохраняется между деплоями, если задан `DB_PATH=/data/quiz_bot.db`.
- При заданных `GITHUB_TOKEN` и `GITHUB_REPOSITORY` бот каждые 5 минут пушит бэкап в `db_backup/quiz_bot_backup.db` — данные можно восстановить из репозитория.
- Файл `words.json` подтягивается из репозитория при каждом деплое — меняется при следующем `git push`.

---

## 4. Полезные ссылки и команды

| Действие              | Где в Railway / команда              |
|-----------------------|--------------------------------------|
| Логи                  | Сервис → **Logs**                    |
| Переменные            | Сервис → **Variables**               |
| Рестарт               | **Deployments** → последний деплой → **Redeploy** |
| Ручная команда запуска| **Settings** → **Start Command**     |
| Том для БД            | **Settings** → **Volumes**           |

---

## 5. Локальная разработка

В проекте подключён `python-dotenv`: при запуске `python bot.py` автоматически подгружается файл `.env` из корня (если есть).

1. Создайте в корне проекта файл `.env` (он в `.gitignore`, в репозиторий не попадёт):
   ```
   BOT_TOKEN=ваш_токен_от_BotFather
   DB_PATH=quiz_bot.db
   ```
2. Запуск: `python bot.py`.

После настройки деплоя все дальнейшие обновления сводятся к правкам в коде и `git push` (при включённом автодеплое).
