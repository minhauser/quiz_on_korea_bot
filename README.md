# Quiz Telegram Bot (Korean vocabulary)

Telegram-бот: квиз по корейским словам и режим **⚔️퀴즈 · 배틀🛡**.

## v8 — что нового

- **랜덤 배틀:** если за 10 сек никто не принял приглашение, бой стартует автоматически с «соперником» под человеческим именем (по уровню).
- Имена ботов по уровням: 초급 / 중급 / 고급.

## Railway (обязательно перед деплоем)

В **Variables** сервиса:

| Переменная | Значение |
|------------|----------|
| `BOT_TOKEN` | токен **боевого** бота от [@BotFather](https://t.me/BotFather) |
| `DB_PATH` | `/data/quiz_bot.db` |

**Volume:** mount path `/data` (иначе база пропадёт при редеплое).

**Start Command:** `python bot.py` (или оставить из `Procfile` / `railway.toml`).

Опционально (бэкап БД в GitHub): `GITHUB_TOKEN`, `GITHUB_REPOSITORY` = `minhauser/quiz_on_korea_bot`.

Подробнее: [DEPLOY.md](DEPLOY.md)

## Локальный запуск

```powershell
cd "путь\к\проекту"
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# отредактируйте .env — BOT_TOKEN
python bot.py
```

Не запускайте локально бота с **тем же** `BOT_TOKEN`, что на Railway — будет конфликт polling.

## В Git не попадает

`.env`, `.venv/`, `quiz_bot.db`
