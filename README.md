# 🧮 ESCAPE // MATH SYSTEM

수학 개념을 *세계관 규칙*으로 체험하는 인터랙티브 방탈출 웹.

순수 HTML / CSS / JavaScript (ES modules) — 빌드 도구 없이 정적 파일만으로 동작합니다.

## 챕터

| # | 방 | 수학 개념 |
|---|---|---|
| 01 | Binary Firewall    | 조합 · 격자 경로 · 중심 대칭 짝짓기 |
| 02 | Mirror Chamber     | 에라토스테네스의 채 · 쌍둥이 소수 |
| 03 | Ancient Temple     | 중국인의 나머지 정리 (CRT) · 모듈러 역원 |
| 04 | Quantum Casino     | 페르마 소정리 · 원시근 · 이산 로그 |
| 05 | Matrix Vault       | 선형 변환 · 행렬식 · 면적 배율 |
| 06 | Eigenchamber       | 고유값 · 고유벡터 · 불변 방향 |
| 07 | Regression Lab     | 최소제곱 · MSE · 선형 회귀 |
| 08 | Recursion Reactor  | 점화식 · 피보나치 · 동적 계획법 |

각 방의 헤더 `📐 CONCEPT` 버튼으로 정의·맥락·응용을 펼쳐 볼 수 있습니다. 답이 직접 노출되지 않도록 *원리·시각 단서* 중심으로 작성됐어요. 클리어 여부와 상관없이 어떤 방이든 자유롭게 들어갈 수 있습니다.

## 로컬 실행

빌드 단계가 없어 정적 서버 하나면 됩니다.

```bash
# Python 3
python -m http.server 5757

# 또는 Node
npx serve .
```

브라우저에서 `http://localhost:5757` 열기.

## 배포 (Vercel)

Vercel 대시보드에서 이 저장소를 import 하면 즉시 배포됩니다 — 정적 사이트라 별도 설정 불필요. CLI 라면:

```bash
npm i -g vercel
vercel
```

## 구조

```
escape/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── main.js          # 부트스트랩 & 라우터
    ├── bg.js            # 배경 캔버스
    ├── audio.js         # Web Audio synth
    ├── ui.js            # el(), TypingLog, toast
    ├── screens/
    │   ├── intro.js
    │   ├── chapters.js
    │   └── room.js      # 모든 방이 들어가는 공용 쉘
    └── rooms/
        ├── index.js     # 룸 레지스트리
        ├── firewall.js
        ├── mirror.js
        ├── temple.js
        ├── casino.js
        ├── matrix.js
        ├── eigen.js
        ├── regression.js
        └── recursion.js
```

새 방을 추가하려면 `js/rooms/<id>.js` 파일에서 `RoomModule` 인터페이스를 export 하고 `js/rooms/index.js` 의 배열에 추가하기만 하면 됩니다.
