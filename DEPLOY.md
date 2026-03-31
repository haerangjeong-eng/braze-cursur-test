# 웹 배포 가이드 (다른 사람 접근 가능하게 하기)

이 빌더는 **정적 웹앱**이라서 Vercel, Netlify, GitHub Pages 등에 무료로 배포할 수 있습니다.

---

## 방법 1: Vercel (가장 쉬움, 추천)

1. **프로젝트를 GitHub에 올리기**
   - GitHub에서 새 저장소(repo) 만든 뒤, 이 폴더를 푸시합니다.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/내아이디/저장소이름.git
   git push -u origin main
   ```

2. **Vercel에 배포**
   - [vercel.com](https://vercel.com) 접속 → **Sign Up** (GitHub 계정으로 로그인)
   - **Add New Project** → **Import** 클릭 후 방금 올린 GitHub 저장소 선택
   - **Framework Preset**: Vite 선택 (자동 감지될 수 있음)
   - **Root Directory**: 비워두거나 `./` 유지
   - **Deploy** 클릭

3. **완료**
   - 1~2분 후 `https://프로젝트이름.vercel.app` 같은 주소가 생깁니다.
   - 이 링크를 다른 사람에게 공유하면 됩니다.

---

## 방법 2: Netlify

1. [netlify.com](https://www.netlify.com) 접속 → **Sign up** (GitHub 연동 가능)
2. **Add new site** → **Import an existing project** → GitHub에서 저장소 선택
3. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Deploy site** 클릭
5. 배포 후 `https://랜덤이름.netlify.app` 주소가 생성됩니다.

---

## 방법 3: GitHub Pages (저장소가 public일 때)

1. GitHub에 코드 푸시 (위와 동일)
2. **Settings** → **Pages** → Source: **GitHub Actions**
3. 프로젝트 루트에 아래 파일 추가 후 푸시:

**`.github/workflows/deploy.yml`** (파일 새로 만들기):

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. 한 번 푸시하면 자동으로 빌드·배포됩니다.
5. **Settings → Pages** 에서 URL 확인 (예: `https://사용자이름.github.io/저장소이름/`)

> GitHub Pages는 **서브경로**에 배포되므로, Vite에 `base: '/저장소이름/'` 설정이 필요할 수 있습니다. 그때는 `vite.config.js`에 `base: '/저장소이름/'` 추가 후 다시 배포하세요.

---

## 로컬에서 배포 전 확인

터미널에서:

```bash
npm run build
npm run preview
```

브라우저에서 `http://localhost:4173` 등으로 열어보고, 동작이 정상이면 위 방법 중 하나로 배포하면 됩니다.

---

## 요약

| 서비스       | 난이도 | 무료 한도     | 추천 |
|-------------|--------|---------------|------|
| **Vercel**  | ⭐ 쉬움 | 넉넉함        | ✅   |
| **Netlify** | ⭐ 쉬움 | 넉넉함        | ✅   |
| **GitHub Pages** | 보통 | public repo 기준 | 가능 |

**가장 빠른 방법:** GitHub에 올린 뒤 Vercel에서 **Import** 한 번 하면 끝입니다.
