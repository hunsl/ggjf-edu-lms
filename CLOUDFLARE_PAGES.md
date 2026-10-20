# 학사관리 운영 주소

회사망에서 사용할 새 주소: https://gyeonggi-edu-lms.pages.dev/

이 프로젝트는 Cloudflare Pages의 `gyeonggi-edu-lms`에 배포합니다. 대시보드 프로젝트인 `gyeonggi-dashboard`와 구분합니다. 기존 Supabase 연결과 데이터 보호 기능을 그대로 유지합니다. 데이터베이스 변경이나 자료 이전 작업은 없습니다.

## 배포

PowerShell에서 이 저장소를 열고 실행합니다.

```powershell
./prepare-pages.ps1
npx --yes wrangler@4.151.2 pages deploy dist --project-name gyeonggi-edu-lms --branch main
```

`dist`에는 화면 실행에 필요한 세 파일과 HTTP 헤더 설정만 들어갑니다. 저장소 전체, JSON 백업, 첨부 원본 사본, SQL 파일은 업로드하지 않습니다. `prepare-pages.ps1`은 예상하지 못한 파일이나 하위 폴더가 있으면 준비를 중단합니다.

현재 방식은 직접 업로드이므로 GitHub에 소스를 올리는 것만으로 Cloudflare 배포가 갱신되지는 않습니다. 앱을 수정한 후에는 위 배포 단계를 실행해야 합니다.

## 주소 변경 후 확인

새 주소에서는 기존 계정으로 다시 로그인합니다. 과정·훈련생·출결·서버에 저장된 발급 이력과 첨부파일은 같은 데이터베이스에서 불러옵니다. 이전 주소에만 저장된 브라우저 로그인 상태와 로컬 감사 로그는 새 주소로 자동 이전되지 않습니다.

기존 창은 닫고 새 주소를 북마크하세요. 새로 생성하는 QR 및 증명서 확인 링크는 새 주소를 사용하지만, 이미 발급한 링크의 주소가 자동으로 바뀌지는 않습니다.
