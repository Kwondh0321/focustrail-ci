# FocusTrail CI

한국어 | [English](README.en.md)

FocusTrail CI는 정적 HTML에서 키보드 포커스 순서를 추출하고 위험한 패턴을 검사하며, 현재 결과를 저장된 기준선과 비교합니다. CLI와 GitHub Composite Action으로 사용할 수 있습니다.

## 사용

```bash
git clone https://github.com/Kwondh0321/focustrail-ci.git
cd focustrail-ci
npm ci
node src/cli.mjs scan examples/form.html --format text
node src/cli.mjs scan examples/form.html --output focus.json
node src/cli.mjs compare baseline.json focus.json
```

## 검사 규칙

- `FT001`: 양수 `tabindex`가 자연스러운 순서를 변경함
- `FT002`: 접근성 트리에서 숨긴 요소가 포커스를 받음
- `FT003`: `role="button"` 요소가 키보드 포커스를 받지 못함
- `FT004`: 중복 ID로 포커스 대상이 모호함
- `FT005`: autofocus가 사용자 의도 없이 포커스를 이동할 수 있음
- `FT006`: `tabindex`가 유효한 정수가 아님

```yaml
- uses: Kwondh0321/focustrail-ci@v0.1.0
  with:
    html: dist/index.html
    baseline: accessibility/focus-baseline.json
```

정적 분석은 런타임 DOM, Shadow DOM, CSS 가시성, 실제 포커스 트랩을 관찰하지 못하므로 브라우저 기반 접근성 테스트와 함께 사용해야 합니다.

## 개발

```bash
npm run check
npm test
npm run smoke
```

## 라이선스

MIT
