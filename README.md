# 🇰🇷 Quiz Telegram Bot (Korean Vocabulary)

한국어 학습자를 위한 Telegram 퀴즈 봇입니다.

사용자는 한국어 단어 퀴즈를 통해 어휘력을 향상시킬 수 있으며, 레벨별 문제를 풀고 다른 사용자와 배틀 모드를 진행할 수 있습니다.

---

# Hero

### Problem

외국인 학습자들은 한국어 단어를 꾸준히 암기하기 어렵고, 반복 학습 과정이 지루하다는 문제가 있습니다.

### Solution

Telegram 기반 퀴즈 봇을 통해 별도의 앱 설치 없이 한국어 단어를 학습할 수 있도록 구현했습니다.

### Project Status Badges

[![Deployment](https://img.shields.io/badge/Deployment-Railway-blue)](https://railway.app)
[![Tests](https://img.shields.io/badge/Tests-Manual%20%2F%20Pytest-yellowgreen)](#)
[![Tech](https://img.shields.io/badge/Tech-Python%20%7C%20Aiogram%20%7C%20SQLite-lightgrey)](#)
[![Demo](https://img.shields.io/badge/Demo-Core%20Features-red)](#)

### Tech Stack

* Python
* Aiogram
* SQLite
* Telegram Bot API
* Railway
* GitHub

### Highlights

* 한국어 단어 퀴즈
* 레벨 시스템 (초급 / 중급 / 고급)
* 실시간 배틀 모드
* 자동 상대 매칭
* Telegram 기반 서비스
* Railway 배포

---

# Demo

### Start

```bash
/start
```

### Quiz Flow

1. 사용자가 퀴즈 시작
2. 단어 문제 출제
3. 정답 선택
4. 점수 및 결과 확인
5. 다음 문제 진행

### Battle Flow

1. 사용자 A가 배틀 생성
2. 사용자 B 참가
3. 제한 시간 내 문제 풀이
4. 점수 비교
5. 승자 결정

---

# Features

## Vocabulary Quiz

* 한국어 단어 학습
* 객관식 문제 제공
* 즉시 정답 확인

## Level System

* 초급
* 중급
* 고급

사용자 수준에 맞는 문제 제공

## Battle Mode

* 다른 사용자와 1:1 대결
* 실시간 점수 경쟁
* 자동 매칭 지원

## Statistics

* 사용자 기록 저장
* 점수 관리
* 학습 진행도 확인

## Telegram Native UX

* 별도 설치 불필요
* Telegram 환경에서 바로 사용 가능

---

# Architecture

```text
User
  │
  ▼
Telegram Client
  │
  ▼
Telegram Bot API
  │
  ▼
Aiogram Bot
  │
  ├── Quiz Handler
  ├── Battle Handler
  ├── Matchmaking Service
  └── User Service
  │
  ▼
SQLite Database
```

## Architecture Diagrams

![Quiz Bot Flowchart](Flowchart_Quiz.svg)

### Components

#### Bot Layer (bot.py)

- **메인 엔트리포인트**: asyncio 기반 이벤트 루프 및 Aiogram Dispatcher
- **명령어 핸들러**: `/start`, `/quiz`, `/battle`, `/ranking`, `/stats`, `/admin`
- **콜백 핸들러**: 인라인 버튼 클릭, 난이도 선택, 배틀 참가 등
- **DB 초기화**: SQLite 스키마 생성 및 마이그레이션
- **선택적 백업**: GitHub으로 주기적 DB 백업

#### Handlers (handlers/)

- `battle_handler.py`: 배틀 모드 콜백 및 메시지 핸들러
  - 배틀 난이도 선택, 매칭 인터페이스, 결과 표시

#### Services (services/)

- `battle_service.py`: 배틀 생성, 상태 관리, 점수 계산
- `battle_ai.py`: AI 상대방 로직 및 수준별 AI 이름 생성
- `battle_invite.py`: 배틀 초대 및 Deep Link 관리

#### Models (models/)

- `battle.py`: 배틀 데이터 구조 (상태, 점수, 참가자 정보)

#### Utils (utils/)

- `battle_timer.py`: 배틀 타이머 관리 및 타임아웃 처리

#### Data (data/)

- `words.json`: 한국어 단어 데이터 (초급/중급/고급 레벨별)
- `quiz_bot.db`: SQLite 데이터베이스 (Railway 볼륨에서 지속)

---

## Project Structure

```
quiz_on_korea_bot/
├── bot.py                    # 메인 봇 애플리케이션 (DB, 핸들러, 비즈니스 로직)
├── requirements.txt          # Python 패키지 의존성
├── runtime.txt              # Python 버전 명시 (Railway용: 3.11.9)
├── .env.example             # 환경 변수 샘플 템플릿
├── .gitignore               # Git 제외 패턴 (.env*, *.db, __pycache__)
├── words.json               # 퀴즈 단어 데이터 (초급/중급/고급)
├── README.md                # 프로젝트 문서
├── DEPLOY.md                # 배포 가이드
│
├── handlers/                # Telegram 핸들러 모듈
│   ├── __init__.py
│   └── battle_handler.py    # 배틀 콜백 및 메시지 처리
│
├── services/                # 비즈니스 로직 서비스
│   ├── __init__.py
│   ├── battle_service.py    # 배틀 생성, 상태 관리
│   ├── battle_ai.py         # AI 상대방 로직
│   └── battle_invite.py     # 배틀 초대 및 초대 링크 관리
│
├── models/                  # 데이터 모델 & 타입
│   ├── __init__.py
│   └── battle.py            # 배틀 관련 데이터 구조
│
├── utils/                   # 유틸리티 함수
│   ├── __init__.py
│   └── battle_timer.py      # 배틀 타이머 및 타임아웃 관리
│
├── db_backup/               # GitHub 백업 저장소 (선택)
│   └── quiz_bot_backup.db   # 데이터베이스 백업 파일
│
├── Railway 설정 파일들
│   ├── railway.toml         # Railway 네이티브 설정
│   ├── nixpacks.toml        # Nix 빌드 설정
│   └── Procfile             # Procfile 프로세스 타입
│
└── .github/                 # GitHub 설정
    └── ...                  # GitHub Actions, PR 템플릿 등
```

### 주요 파일별 역할

| 파일 | 목적 | 크기 | 유지보수 난도 |
|------|------|------|---------------|
| `bot.py` | 메인 봇 로직, DB 초기화, 모든 핸들러 | ~1000+ 라인 | 중상 |
| `words.json` | 퀴즈 데이터 (단어, 난이도, 선택지) | 구동 | 낮음 |
| `handlers/battle_handler.py` | 배틀 모드 콜백 처리 | ~300 라인 | 중 |
| `services/battle_service.py` | 배틀 상태 및 매칭 로직 | ~200 라인 | 중 |
| `services/battle_ai.py` | AI 상대방 알고리즘 | ~100 라인 | 낮음 |
| `utils/battle_timer.py` | asyncio 기반 타이머 | ~50 라인 | 낮음 |

### 코드 흐름 예시 (퀴즈 시작)

```
User: /quiz
  ↓
bot.py → handle_quiz_start()
  ↓
난이도 선택 키보드 표시 (초급/중급/고급/AI Quiz)
  ↓
User: 버튼 클릭 (예: "초급")
  ↓
bot.py → handle_quiz_level_selected(callback)
  ↓
quiz_session 생성 → 첫 문제 출제
  ↓
User: 정답 선택
  ↓
bot.py → verify_answer()
  ├─ 정답 여부 판별
  ├─ 점수 계산 및 스트릭 업데이트
  ├─ answers 테이블에 기록
  └─ 다음 문제 또는 결과 표시
```

---

# Runbook

## Prerequisites

다음 항목들이 필요합니다:

- **Python** 3.11 권장 (최소 3.8 이상, Aiogram 3.0.0+ 호환)
  - 권장: Python 3.11 이상 (최신 성능 및 보안 업데이트)
  - 최소: Python 3.8+ (asyncio, typing 지원)
  - ❌ 지원 불가: Python 3.7 이하
- **pip** (Python 패키지 관리자)
- **Git** (소스 코드 클론용)
- **Telegram Bot Token** - [BotFather](https://t.me/botfather)에서 생성
  - BotFather에 `/start` 메시지를 보낸 후 `/newbot`으로 새 봇 생성
  - 수신한 토큰을 `BOT_TOKEN` 환경 변수로 사용
- **Railway 계정** (Railway 배포 시) - [Railway.app](https://railway.app)

---

## Installation

### 1. 저장소 클론

```bash
git clone https://github.com/minhauser/quiz_on_korea_bot.git
cd quiz_on_korea_bot
```

### 2. 가상 환경 설정

```bash
# macOS / Linux
python3 -m venv venv
source venv/bin/activate

# Windows (PowerShell)
python -m venv venv
venv\Scripts\Activate.ps1

# Windows (Command Prompt)
python -m venv venv
venv\Scripts\activate.bat
```

### 3. 필수 라이브러리 설치

```bash
pip install -r requirements.txt
```

**requirements.txt 구성:**
- `aiogram>=3.0.0` - Telegram Bot API 프레임워크 (async 기반 핸들러)
- `aiosqlite>=0.22.0` - SQLite 비동기 드라이버
- `openpyxl>=3.1.0` - 엑셀 파일 생성 및 내보내기
- `python-dotenv>=1.0.0` - `.env` 파일에서 환경 변수 로드

---

## Environment Variables

### 샘플 파일 (.env.example)

```env
# [필수] Telegram Bot Token (BotFather에서 받은 토큰)
BOT_TOKEN=your_telegram_bot_token_here

# [필수] 데이터베이스 경로 (로컬 개발)
DB_PATH=./data/quiz_bot.db

# [선택] GitHub 백업 설정
# GitHub 토큰 (Personal Access Token with repo scope)
GITHUB_TOKEN=your_github_token_here

# GitHub 저장소 (format: owner/repo)
GITHUB_REPOSITORY=minhauser/quiz_bot_backup

# 백업 간격 (초 단위, 기본값: 300초 = 5분)
BACKUP_INTERVAL_SEC=300
```

### 환경 변수 설정 방법

#### 로컬 개발 환경

1. 프로젝트 루트에 `.env` 파일 생성:

```bash
cp .env.example .env
# 또는 수동으로 .env 파일 생성 후 위 내용 입력
```

2. 각 변수 값 입력:
   - `BOT_TOKEN`: BotFather에서 받은 토큰 입력
   - `DB_PATH`: 로컬 데이터베이스 저장 경로 (기본값: `./data/quiz_bot.db`)
   - 선택 변수는 필요한 경우에만 입력

#### Railway 배포 환경

Railway 대시보드에서 직접 환경 변수 설정:

1. Railway 프로젝트 선택 → **Variables** 탭
2. 각 변수 추가:
   - `BOT_TOKEN`: Telegram 봇 토큰
   - `DB_PATH`: `/data/quiz_bot.db` (Railway Volume 경로)
   - 선택 변수: GitHub 백업 설정 (필요 시)

**⚠️ 보안 주의:** `.env` 파일을 Git에 커밋하지 마세요. `.gitignore`에 `.env*` 패턴이 이미 등록되어 있습니다.

---

## Run

### 개발 모드 (Development)

로컬 환경에서 봇을 테스트할 때 사용합니다:

```bash
# 1. 가상 환경 활성화
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate  # Windows

# 2. 봇 실행
python bot.py
```

**개발 모드 특징:**
- 로컬 `.env` 파일에서 환경 변수 자동 로드
- SQLite 데이터베이스는 `./data/quiz_bot.db` (로컬 파일)
- 콘솔에 로그 출력 (디버깅 용이)
- `python-dotenv`가 `.env` 파일을 자동으로 로드

**예상 출력:**
```
INFO: Starting bot...
INFO: Connected to database at ./data/quiz_bot.db
INFO: Polling for updates...
```

### 운영 모드 (Production - Railway)

Railway 환경에서 자동으로 실행됩니다:

```bash
# Railway에서 자동 실행 (수동 실행 불필요)
python bot.py
```

**운영 모드 특징:**
- Railway 환경 변수에서 설정값 로드
- SQLite 데이터베이스는 `/data/quiz_bot.db` (Railway Volume)
- 24/7 지속 실행
- 데이터베이스 자동 백업 (GitHub 토큰이 설정된 경우)

**Railway 설정 확인:**
1. Railway 대시보드 → **Settings** → **Environment**
2. 변수 설정 확인
3. **Deployments** 탭에서 배포 상태 모니터링

### 봇 상호작용

Telegram에서 봇과 상호작용:

1. Telegram 앱 열기
2. 검색창에서 봇 사용자명 검색 (BotFather에서 받은 이름)
3. 봇과의 채팅 시작
4. `/start` 명령어로 메인 메뉴 표시
5. 제공되는 명령어 사용:
   - `/quiz` - 퀴즈 시작 (난이도 선택)
   - `/battle` - 배틀 모드 초대
   - `/ranking` - 랭킹 조회
   - `/stats` - 사용자 통계
   - `/admin` - 관리자 메뉴 (관리자만)

---

## Test

### 수동 테스트 (Manual Testing)

봇이 정상 작동하는지 확인:

```bash
# 1. 봇 실행
python bot.py

# 2. 다른 터미널에서 데이터베이스 확인
python -c "
import sqlite3
conn = sqlite3.connect('./data/quiz_bot.db')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type=\"table\"')
tables = cursor.fetchall()
print('Tables:', tables)
conn.close()
"

# 3. Telegram에서 봇 테스트
# - /start 명령어 입력
# - 메뉴 버튼 클릭
# - 퀴즈 진행 및 정답 제출
# - 배틀 모드 초대 및 참가 테스트
```

### 통합 테스트 항목

각 기능별 수동 검증:

| 기능 | 테스트 항목 | 확인 방법 |
|------|-----------|---------|
| **명령어** | `/start`, `/quiz`, `/battle`, `/ranking`, `/stats` | Telegram에서 각 명령어 실행 |
| **퀴즈** | 난이도 선택, 문제 출제, 정답 제출, 스트릭 증감 | 5문제 이상 풀이 후 DB 확인 |
| **배틀** | 초대 생성, 참가 수락, 매칭, 스코어 기록 | 두 사용자로 배틀 진행 |
| **DB 저장** | 사용자 데이터, 통계, 배틀 기록 | `sqlite3 ./data/quiz_bot.db` 콘솔에서 쿼리 |
| **환경 변수** | BOT_TOKEN 로드, DB_PATH 적용 | 봇 실행 콘솔 로그 확인 |

### 데이터베이스 검증

```bash
# SQLite 콘솔 열기
sqlite3 ./data/quiz_bot.db

# 테이블 목록 확인
.tables

# 사용자 정보 확인
SELECT id, name, level, total_score FROM users LIMIT 5;

# 배틀 기록 확인
SELECT * FROM battles LIMIT 5;

# 쿼리 종료
.quit
```

---

## Troubleshooting

### Bot does not respond to commands

**증상:** 봇에 메시지를 보냈으나 응답 없음

**원인:**
- `BOT_TOKEN` 설정 오류
- 토큰이 만료되었거나 잘못됨
- 봇 프로세스가 종료됨
- Telegram API 연결 실패

**해결 방법:**

```bash
# 1. BOT_TOKEN 확인
cat .env | grep BOT_TOKEN

# 2. 토큰이 유효한지 확인 (curl 사용)
curl https://api.telegram.org/bot{BOT_TOKEN}/getMe
# 응답: {"ok":true,"result":{"id":...,"is_bot":true,...}}

# 3. 봇이 실행 중인지 확인
ps aux | grep bot.py

# 4. 로그 확인
python bot.py  # 콘솔에서 직접 실행하여 에러 메시지 확인

# 5. 토큰 갱신 (필요 시)
# BotFather에서 /newbot으로 새 토큰 생성
# .env 파일에서 BOT_TOKEN 업데이트
```

### Database Error / "database is locked"

**증상:** 
```
sqlite3.OperationalError: database is locked
```

**원인:**
- 여러 프로세스가 동시에 DB 접근
- WAL 파일 손상
- 파일 시스템 권한 문제

**해결 방법:**

```bash
# 1. 실행 중인 봇 프로세스 종료
# Ctrl+C (현재 터미널)
# 또는
pkill -f "python bot.py"

# 2. 임시 WAL 파일 확인 및 정리
ls -la ./data/
# 파일: quiz_bot.db, quiz_bot.db-wal, quiz_bot.db-shm

# 3. 필요 시 WAL 파일 삭제 (데이터 손실 주의!)
rm -f ./data/quiz_bot.db-wal ./data/quiz_bot.db-shm

# 4. 데이터베이스 무결성 확인
sqlite3 ./data/quiz_bot.db "PRAGMA integrity_check;"

# 5. 봇 재시작
python bot.py
```

### Battle Matching Not Working

**증상:** 배틀 초대 후 매칭되지 않음

**원인:**
- 상대방이 초대를 수락하지 않음
- 매칭 타임아웃 (10초 후 AI 매칭)
- 데이터베이스에 배틀 데이터 미저장
- Telegram 메시지 전달 지연

**해결 방법:**

```bash
# 1. 데이터베이스에서 배틀 상태 확인
sqlite3 ./data/quiz_bot.db
SELECT id, initiator_id, participant_id, status FROM battles ORDER BY created_at DESC LIMIT 5;

# 2. 10초 대기 후 자동으로 AI와 매칭됨
# 설정된 대기 시간 확인 (bot.py에서 BATTLE_WAIT_TIMEOUT)

# 3. 로그 확인
python bot.py  # 콘솔에서 매칭 관련 로그 메시지 확인

# 4. Telegram 네트워크 상태 확인
# - 인터넷 연결 상태 확인
# - VPN 사용 시 Telegram API 접근 확인
```

### ImportError: No module named 'aiogram'

**증상:**
```
ModuleNotFoundError: No module named 'aiogram'
```

**원인:**
- 가상 환경이 활성화되지 않음
- 패키지 설치 미완료

**해결 방법:**

```bash
# 1. 가상 환경 활성화 확인
# 터미널 프롬프트에 (venv) 표시 확인
which python  # 또는 Get-Command python (Windows)

# 2. 가상 환경 재설정
rm -rf venv  # 또는 rmdir /s venv (Windows)
python -m venv venv
source venv/bin/activate  # (또는 Windows: venv\Scripts\activate)

# 3. 패키지 재설치
pip install -r requirements.txt

# 4. 설치 확인
python -c "import aiogram; print(aiogram.__version__)"
```

### Railway Deployment Failed

**증상:** Railway에서 배포 실패

**원인:**
- 환경 변수 미설정
- `BOT_TOKEN`이 없음
- Volume이 연결되지 않음
- 빌드 오류

**해결 방법:**

```bash
# 1. Railway 환경 변수 확인
# Railway 대시보드 → Variables 탭
# 필수: BOT_TOKEN, DB_PATH (=/data/quiz_bot.db)

# 2. Railway Volume 확인
# Railway 대시보드 → Settings → Volumes
# /data 볼륨이 `/data` 경로에 마운트되어 있는지 확인

# 3. Railway 배포 로그 확인
# Railway 대시보드 → Deployments → 배포 선택 → Logs 탭

# 4. 로컬에서 테스트
source venv/bin/activate
python bot.py  # 로컬 실행으로 기본 오류 확인

# 5. Railway에 푸시
git add .
git commit -m "fix: deployment issue"
git push origin main  # 자동 배포 시작
```

### Python Version Compatibility Issues

**증상:** 설치 또는 실행 중 다음 오류들 발생
```
SyntaxError: invalid syntax (async/await 관련)
TypeError: 'coroutine' object is not callable
ImportError: cannot import name 'asynccontextmanager'
ModuleNotFoundError: No module named 'aiogram'
```

**원인:**
- Python 버전이 3.8 미만
- Aiogram 3.0.0은 Python 3.8+ (asyncio 지원)을 요구
- Python 3.7 이하에서는 async/await 문법에 제한이 있음

**해결 방법:**

#### 1. 현재 Python 버전 확인

```bash
python --version
# 또는
python3 --version
```

**예상 출력:**
```
Python 3.11.9  ✅ (권장)
Python 3.10.x  ✅ (지원)
Python 3.9.x   ✅ (지원)
Python 3.8.x   ⚠️ (최소 버전, 가능하지만 권장하지 않음)
Python 3.7.x   ❌ (지원 불가)
Python 2.7.x   ❌ (지원 불가)
```

#### 2. Python 버전 업그레이드 필요 시

**Windows:**

```bash
# 1. python.org에서 최신 버전 다운로드 및 설치
# https://www.python.org/downloads/
# → Python 3.11 또는 3.12 선택
# → 설치 시 "Add Python to PATH" 체크 (중요!)

# 2. 설치 확인
python --version
python -c "import sys; print(sys.version)"
```

**macOS:**

```bash
# Homebrew 사용 (권장)
brew install python@3.11

# 또는 python.org에서 직접 다운로드
# https://www.python.org/downloads/

# 버전 확인
python3 --version
```

**Linux (Ubuntu/Debian):**

```bash
# 패키지 매니저로 설치
sudo apt update
sudo apt install python3.11 python3.11-venv python3.11-dev

# 버전 확인
python3.11 --version

# 기본 python3 버전 업데이트 (선택)
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
```

**Linux (RHEL/CentOS/Fedora):**

```bash
sudo yum install python3.11 python3.11-devel
# 또는 (RHEL 9+)
sudo dnf install python3.11 python3.11-devel

python3.11 --version
```

#### 3. 다중 Python 버전 관리

사용자가 여러 Python 버전을 설치한 경우 `pyenv` 또는 `conda` 사용:

**pyenv 사용:**

```bash
# macOS/Linux에 설치
brew install pyenv  # macOS
# 또는 Linux: curl https://pyenv.run | bash

# 설치 가능한 버전 확인
pyenv install --list | grep "3.11"

# Python 3.11 설치
pyenv install 3.11.9

# 프로젝트에 버전 설정
cd /path/to/quiz_on_korea_bot
pyenv local 3.11.9

# 확인
python --version  # Python 3.11.9
```

**conda 사용:**

```bash
# 환경 목록 확인
conda env list

# Python 3.11 환경 생성
conda create -n quiz-bot python=3.11

# 환경 활성화
conda activate quiz-bot

# 버전 확인
python --version  # Python 3.11.x
```

#### 4. 기존 프로젝트에서 버전 업그레이드

```bash
# 1. 가상 환경 비활성화
deactivate

# 2. 기존 가상 환경 삭제
rm -rf venv  # macOS/Linux
# 또는
rmdir /s venv  # Windows

# 3. Python 3.11 이상으로 새 가상 환경 생성
python3.11 -m venv venv  # 또는 python3 -m venv venv

# 4. 활성화
source venv/bin/activate  # macOS/Linux
# 또는
venv\Scripts\activate  # Windows

# 5. 패키지 재설치
pip install --upgrade pip
pip install -r requirements.txt

# 6. 동작 확인
python bot.py
```

#### 5. 호환성 검증

```bash
# 1. asyncio 모듈 확인
python -c "import asyncio; print('asyncio 지원됨')"

# 2. Aiogram 설치 및 버전 확인
pip install aiogram
python -c "import aiogram; print(f'Aiogram {aiogram.__version__}')"

# 3. 타입 힌팅 지원 확인
python -c "from typing import Set; print('typing 모듈 지원됨')"
```

---

### High CPU / Memory Usage

**증상:** 봇이 과도한 리소스 소비

**원인:**
- 데이터베이스 쿼리 최적화 부족
- 메모리 누수
- 높은 동시 사용자 수

**해결 방법:**

```bash
# 1. 데이터베이스 인덱스 확인
sqlite3 ./data/quiz_bot.db
.indexes

# 2. 느린 쿼리 확인 (bot.py 로그 검토)
# 필요 시 쿼리 최적화

# 3. 메모리 모니터링
# 개발 중: top 또는 Resource Monitor로 모니터링
# Railway: 대시보드의 Metrics 탭에서 CPU/Memory 확인

# 4. 문제 발생 시 봇 재시작
python bot.py  # 재시작
```

---

# Future Improvements

* 랭킹 시스템
* 일일 학습 목표
* 학습 통계 대시보드
* 관리자 페이지
* AI 기반 문제 생성

---

# Tradeoff Decisions

## Situation

- Telegram 기반 퀴즈 봇을 Python과 Aiogram으로 빠르게 구현해야 했습니다.
- 배포 환경은 Railway로 제한되어 있으며, 지속성 있는 저장소가 필요했습니다.
- 프로젝트에는 별도의 프론트엔드가 없고, 주로 백엔드 로직과 봇 흐름이 핵심입니다.

## Alternatives

- SQLite + Railway Volume
- PostgreSQL/MySQL 또는 외부 DB 서비스
- Aiogram 프레임워크 vs raw Telegram Bot API / 다른 Python 텔레그램 라이브러리
- 로컬 `.env` + `.gitignore` vs 코드 내 환경값 하드코딩
- GitHub 백업 자동화 vs 파일 시스템 백업 또는 백업 미구현

## Selection Criteria

- 빠른 개발과 배포
- 낮은 운영 비용 / 간단한 인프라
- 데이터 지속성 및 봇 세션 안정성
- 보안: 토큰과 민감 정보 분리
- 유지보수성과 확장성

## Experience

- SQLite는 단순한 데이터 모델과 적은 트래픽에는 충분했습니다.
- Railway Volume을 통해 로컬 SQLite 파일을 유지하면서도 배포 환경에서 데이터가 유지되는 구조를 확보했습니다.
- Aiogram의 async 핸들러는 Telegram 콜백 흐름과 배틀 로직을 깔끔하게 관리하는 데 도움이 되었습니다.
- 환경 변수 방식으로 `BOT_TOKEN`과 `GITHUB_TOKEN`을 분리한 것은 보안과 배포 일관성 측면에서 유리했습니다.

## Result

- 선택된 구조: Python + Aiogram + SQLite + Railway Volume
- 장점: 간단한 배포, 빠른 개발, 낮은 운영 부담
- 단점: 고부하나 다중 인스턴스 환경에서는 SQLite 확장성이 제한적
- 이후 개선 방향: 트래픽 증가 시 관리형 관계형 DB로 마이그레이션, 테스트 커버리지 및 모니터링 추가

## Technology Trade-off Table

| Technology | Situation | Alternatives | Selection Criteria | Decision | Result | Challenges |
|---|---|---|---|---|---|---|
| Python | 빠른 백엔드 개발이 필요함 | Node.js, Go, Java | 빠른 생산성, 풍부한 라이브러리, Async 지원 | Python 선택 | 빠르게 프로토타이핑 가능 | GIL로 고부하 동시성은 추가 설계 필요 |
| Aiogram | Telegram Bot API를 효율적으로 사용해야 함 | raw Telegram API, python-telegram-bot | Telegram 특화 라우팅, async 콜백 처리 | Aiogram 선택 | 퀴즈/배틀 플로우 구현이 쉬워짐 | 라이브러리 버전 의존성 관리 필요 |
| SQLite | 간단한 배포 환경에서 DB 지속성이 필요함 | PostgreSQL, MySQL, 외부 DB 서비스 | 설치/운영 간편성, 비용, 데이터 지속성 | SQLite 선택 | Railway 볼륨과 함께 간단하게 운영 가능 | — |
| Railway | 빠르게 배포하고 환경변수를 관리해야 함 | VPS, Docker, AWS/GCP | 배포 편의성, 자동화, 비용 | Railway 선택 | 배포가 쉬워짐 | — |
| GitHub 백업 | DB 백업과 이력 관리를 자동화해야 함 | S3, DB 스냅샷, 외부 백업 | 백업 자동화, 접근성, 권한 관리 | GitHub 백업 선택 | GitHub 이력으로 백업 가능 | 토큰 관리 필요 |
| .env | 민감 정보를 코드에서 분리해야 함 | 하드코딩, config 파일 커밋 | 보안, 배포 환경 분리 | .env 사용 | 민감 정보 분리로 보안 강화 | 운영 시 환경 변수 관리 필요 |

---

# 직무별 README 강조점

이 프로젝트는 Python과 Aiogram으로 구현된 Telegram Quiz Bot으로, 전체 구조는 백엔드 중심 README 형식으로 정리하는 것이 가장 적합합니다.

## Backend (API·DB·인증/인가)

### 시스템 아키텍처 및 DB 스키마

- Telegram 메시지와 Callback 요청이 `aiogram` 핸들러로 들어와 처리되는 흐름을 중심으로 설명합니다.
- 실제 데이터베이스 테이블 구조:
  - `users` - 사용자 기본 정보 (user_id, username, first_name, total_score, current_level, correct_streak, wrong_streak, blocked_at)
  - `answers` - 퀴즈 정답 기록 (user_id, word_id, is_correct, delta_score, level, quiz_mode, created_at)
  - `user_level_scores` - 난이도별 점수 (user_id, quiz_mode, total_score)
  - `battles` - 배틀 세션 (initiator_id, opponent_id, is_ai_opponent, level, status, initiator_score, opponent_score, current_word_id)
  - `battle_invites` - 배틀 초대 관리 (battle_id, invited_user_id, invite_token, status, expires_at)
  - `battle_invite_messages` - 초대 메시지 추적 (invite_id, user_id, message_id)
- 외래키 관계: answers → users, battle_invites → battles, battle_invite_messages → battle_invites
- WAL (Write-Ahead Logging) 모드 활성화로 동시성 처리 최적화

### Bot Command API 및 매칭 시스템

**핵심 명령어/핸들러:**
- `/start` — 봇 초기화 및 메인 메뉴 표시 (퀴즈, 배틀, 랭킹, 추천 메뉴)
- `/quiz` 또는 퀴즈 메뉴 버튼 진입 — 난이도 선택 (초급/중급/고급) 및 문제 출제
- `/battle` — 배틀 모드 시작 (난이도 선택 후 상대방 찾기)
- `/ranking` — 난이도별 랭킹 및 TOP 10 조회
- `/stats` — 사용자 개인 통계 및 점수 조회
- `/admin` — 관리자 전용 메뉴 (사용자 차단/해제, DB 엑셀 내보내기)

**배틀 매칭 로직:**
- 배틀 초대 생성 → Deep Link를 포함한 초대 메시지 발송
- 10초 대기 시간: 상대방이 초대 수락 시 그 사용자와 매칭
- 10초 후 미응답 시: 자동으로 AI 봇과 매칭 (AI 봇 이름은 레벨별로 생성)
- 배틀 상태 전이: `waiting` → `in_progress` → `finished`
- 배틀 결과: 점수 비교 후 승패 결정 및 DB 저장

### DB 설계 및 사용자 데이터 저장 방식

**사용자 레벨 시스템:**
- 각 사용자는 `current_level` (초급/중급/고급)과 `total_score`를 보유
- 정답 스트릭 추적: `correct_streak` (연속 정답), `wrong_streak` (연속 오답)
- 레벨 업: 20개 연속 정답 시 다음 레벨로 승격
- 레벨 다운: 3개 연속 오답 시 이전 레벨로 강등
- 최소/최대 레벨: 초급 ↔ 고급 (범위 제한)

**점수 기록:**
- `answers` 테이블: 모든 퀴즈 문제 풀이 기록 저장
- `user_level_scores` 테이블: 난이도별 누적 점수 (quiz_mode: "초급"/"중급"/"고급"/"ai")
- 배틀 점수는 `battles` 테이블에 별도 저장 (배틀 내 점수와 이력 분리)

**데이터 지속성:**
- SQLite 파일 (`quiz_bot.db`)은 Railway 볼륨 `/data`로 유지
- 로컬 개발: `DB_PATH=./data/quiz_bot.db`
- Railway 배포: `DB_PATH=/data/quiz_bot.db`
- WAL 모드 활성화: 동시 읽기/쓰기 최적화 및 충돌 감소

### 배포 구조 및 운영

- Railway 배포 구성:
  - `BOT_TOKEN`, `DB_PATH`, `GITHUB_TOKEN`, `GITHUB_REPOSITORY` 환경 변수 사용
  - `/data` 볼륨 마운트로 SQLite 지속성 확보
- 선택적 DB 백업:
  - `GITHUB_TOKEN`과 `GITHUB_REPOSITORY`가 설정된 경우 주기적 GitHub 업로드로 백업
  - 환경 변수 비노출 정책으로 민감값은 코드에서 분리

### 보안 및 운영 안정성

- 민감 정보는 `.env` 또는 배포 환경 변수에만 저장하고 코드/레포에는 절대 커밋하지 않습니다.
- Telegram Bot Token과 GitHub Token의 노출 방지, `.gitignore`에 `.env`와 `quiz_bot.db`를 포함합니다.
- 입력값 검증과 예외 처리로 잘못된 Callback 데이터 또는 DB 오류가 발생해도 서비스가 중단되지 않도록 설계합니다.

## GitHub Issue / PR 관리 및 Troubleshooting

- 커밋 메시지는 Conventional Commits 방식(`feat`, `fix`, `docs`, `chore`, `refactor` 등)으로 관리합니다.
- 주요 변경 사항과 배포 이력은 `README`와 `DEPLOY.md`에 기록하여 협업 시 참고할 수 있게 합니다.
- 장애 대응 항목:
  - `BOT_TOKEN` 오류
  - `DB_PATH` 또는 볼륨 미설정
  - 매칭/배틀 로직 예외
  - 로깅과 에러 메시지 확인 절차

# Author

순나툴러 (Sunnatulla Mamurov)

Soonchunhyang University
Department of Internet of Things

Python · Aiogram · Telegram Bot Development
