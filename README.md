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

# 직무별 README 강조점

## Frontend (화면 흐름·컴포넌트·상태관리)

### 컴포넌트 아키텍처 및 상태 관리 구조도

- 전역/지역 상태 관리 방식 (Redux, Zustand, Recoil 등) 과 데이터 흐름
- 기술 재사용성을 고려한 공통 컴포넌트 설계 구조 설명

### 사용자 경험(UX) 및 성능 최적화

- 화면 흐름도(User Flow) 또는 주요 핵심 기능 GIF 데모
- 초기 로딩 속도 개선(Code Splitting, Lazy Loading) 및 렌더링 최적화 사례

---

## Backend (API·DB·인증/인가)

### 시스템 아키텍처 및 ERD (데이터베이스 설계도)

- 테이블 간의 관계를 명확히 보여주는 ERD 이미지 첨부
- 서버 구성 및 데이터 흐름을 한눈에 보는 아키텍처 다이어그램

### API 명세 및 보안 프로세스

- 핵심 API 리스트 (Swagger 링크 또는 Markdown 테이블 정리)
- JWT, OAuth2 등을 활용한 로그인(인증/인가) 처리 흐름 기술

---

## Security (위협 모델·권한 통제)

### 위협 모델링 및 취약점 분석 점검표

- 프로젝트에서 발생할 수 있는 보안 위협(예: OWASP Top 10) 정의 및 대응책
- 입력값 검증, SQL Injection 및 XSS 방어 로직 설명

### 접근 제어 및 권한 관리 체계

- 사용자 역할(Role)별 페이지/API 접근 권한 통제 매트릭스
- 민감 데이터(비밀번호, 개인정보) 암호화 알고리즘 및 키 관리 방식

---

## Data (데이터 출처·정제·지표)

### 데이터 파이프라인 및 수집 출처

- 데이터 수집 대상(공공 API, 크롤링, DB 로그 등)과 수집 주기 명시
- ETL(추출·변환·적재) 데이터 파이프라인 구조도

### 데이터 정제 기술 및 핵심 지표(KPI)

- 결측치, 이상치 처리 및 정규화 등 데이터 전처리 기준 기록
- 프로젝트를 통해 도출한 핵심 비즈니스 지표 및 시각화 대시보드 설명

# Author

순나툴러 (Sunnatulla Mamurov)

Soonchunhyang University
Department of Internet of Things

Python · Aiogram · Telegram Bot Development
