# Yogurtland 맛테스트

Yogurtland 고객을 위한 인터랙티브 맛테스트 애플리케이션입니다.

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 자동 열립니다.

### 빌드

```bash
npm run build
```

프로덕션용 빌드 파일이 `build` 폴더에 생성됩니다.

## 📁 프로젝트 구조

```
taste-test/
├── public/
│   └── index.html
├── src/
│   ├── data/
│   │   ├── stores.js       # Yogurtland 매장 데이터
│   │   └── questions.js    # 맛테스트 질문
│   ├── App.js              # 메인 컴포넌트
│   ├── index.js            # 엔트리 포인트
│   └── index.css           # Tailwind CSS
├── package.json
├── tailwind.config.js
└── README.md
```

## 🎯 주요 기능

- **5개 질문 맛테스트**: 사용자 선호도 분석
- **맞춤형 추천**: 아이스크림 맛 + 토핑 조합 추천
- **관리자 모드**: 매장별 메뉴 관리 (비밀번호: admin1234)
- **218개 매장 지원**: 모든 Yogurtland 매장 데이터 포함
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원

## 🔐 관리자 기능

1. 우측 상단 설정 아이콘 클릭
2. 비밀번호 입력: `admin1234`
3. 매장별 판매 맛/토핑 설정 가능

## 🛠️ 기술 스택

- React 18
- Tailwind CSS
- Lucide React (아이콘)
- LocalStorage (데이터 저장)

## 📝 라이센스

© 2024 Yogurtland. All rights reserved.
