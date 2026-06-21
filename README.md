Underpromotion Theme
=========================

개발자를 위한 Jekyll 기반의 포트폴리오 블로그 테마입니다.
**Soft UI / Glassmorphism** 스타일의 현대적인 디자인과 프로젝트 전시에 최적화된 기능을 제공합니다.

## ✨ 주요 특징
- **Modern UI**: 유리 질감(Glassmorphism)과 부드러운 애니메이션이 적용된 세련된 디자인.
- **데이터 기반 그리드**: `_posts`에 작성된 프로젝트를 태그별로 자동 분류하여 메인 화면에 표시.
- **다양한 프리뷰 지원**: 이미지 썸네일뿐만 아니라 iframe(itch.io, 동영상 등)을 통한 프로젝트 미리보기 지원.
- **반응형 디자인**: 모바일과 데스크탑 환경 모두에 최적화된 레이아웃.

## 🚀 시작하기
### 필수 요구 사항
- Ruby 3.2.2 이상
- Bundler & Jekyll

### Bundler 오류가 날 때
`bundler ~> 2.0` 제약 때문에 최신 Bundler(예: 4.x)에서 설치가 막히면, 이 저장소는 Bundler 2.x 이상에서 동작하도록 설정되어 있습니다. 그래도 로컬 환경이 꼬여 있다면 아래처럼 실행하면 됩니다.

```bash
gem install bundler -v 2.7.2
bundle _2.7.2_ install
```

### 설치 및 실행
1. 저장소를 클론합니다.
2. 의존성 라이브러리를 설치합니다:
   ```bash
   bundle install
   ```
3. 로컬 서버를 실행합니다:
   ```bash
   bundle exec jekyll serve
   ```
4. 브라우저에서 `http://localhost:4000`에 접속합니다.

## 📝 콘텐츠 관리
### 프로젝트 추가하기
`_posts` 디렉토리에 새로운 마크다운(`.md`) 파일을 생성합니다. 파일 이름은 `YYYY-MM-DD-title.md` 형식을 권장합니다.

**작성 예시 (Front-matter):**
```yaml
---
layout: portfolio_with_preview   # 프리뷰 기능을 사용하려면 이 레이아웃 선택
tags: [개인 프로젝트, 게임]       # 메인 화면의 카테고리 분류에 사용
thumbnail: project-thumb.png     # /img/portfolio/ 경로 내의 이미지 파일명
summary: "🔧 Unity&#10;🌟 장르 정보&#10;🎮 상태: 완료" # 카드에 표시될 요약 문구
preview: <iframe ...></iframe>   # 상세 페이지 상단에 노출될 미리보기 요소
social:                          # 프로젝트 관련 링크들
  - title: github
    info: Code
    url: https://github.com/...
  - title: itch-io
    info: Play
    url: https://...
---
```

## Demo
View this jekyll theme in action [here](https://chess-freak.github.io/underpromotion/)

<!--
## Screenshot
![screenshot](https://raw.githubusercontent.com/jeromelachaud/freelancer-theme/master/screenshot.png)-->

---------
For more details, read the [documentation](http://jekyllrb.com/)
