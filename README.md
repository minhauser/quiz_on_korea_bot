# 🇰🇷 Quiz Telegram Bot (Korean Vocabulary)

한국어 학습자를 위한 Telegram 퀴즈 봇입니다.

사용자는 한국어 단어 퀴즈를 통해 어휘력을 향상시킬 수 있으며, 레벨별 문제를 풀고 다른 사용자와 배틀 모드를 진행할 수 있습니다.

---

# Hero

### Problem

외국인 학습자들은 한국어 단어를 꾸준히 암기하기 어렵고, 반복 학습 과정이 지루하다는 문제가 있습니다.

### Solution

Telegram 기반 퀴즈 봇을 통해 별도의 앱 설치 없이 한국어 단어를 학습할 수 있도록 구현했습니다.

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

### Components

#### Bot Layer

* 사용자 요청 처리
* 명령어 처리
* 메시지 응답

#### Quiz Service

* 문제 생성
* 정답 판별
* 점수 계산

#### Battle Service

* 배틀 생성
* 참가자 매칭
* 승패 계산

#### Database

* 사용자 정보 저장
* 점수 저장
* 퀴즈 데이터 저장

---

# Runbook

## Local Run

```bash
git clone https://github.com/minhauser/quiz_on_korea_bot.git

cd quiz_on_korea_bot

python -m venv venv

source venv/bin/activate
# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

### Environment Variables

```env
BOT_TOKEN=your_telegram_bot_token
DB_PATH=./data/quiz_bot.db
```

### Start

```bash
python bot.py
```

---

## Railway Deployment

### Variables

```env
BOT_TOKEN=your_token
DB_PATH=/data/quiz_bot.db
```

### Volume

```text
/data
```

### Start Command

```bash
python bot.py
```

---

# Troubleshooting

## Bot does not respond

### Cause

* BOT_TOKEN 설정 오류
* BotFather 토큰 만료

### Solution

* BOT_TOKEN 확인
* Railway Variables 확인

---

## Database Error

### Cause

* DB_PATH 설정 오류
* Volume 미설정

### Solution

* DB_PATH 확인
* Railway Volume 연결 확인

---

## Battle Matching Not Working

### Cause

* 상대방 미참여
* 네트워크 지연

### Solution

* 일정 시간 후 자동 매칭 확인
* 로그 확인

---

# Future Improvements

* 랭킹 시스템
* 일일 학습 목표
* 학습 통계 대시보드
* 관리자 페이지
* AI 기반 문제 생성

---

# Author

순나툴러 (Sunnatulla Mamurov)

Soonchunhyang University
Department of Internet of Things

Python · Aiogram · Telegram Bot Development
