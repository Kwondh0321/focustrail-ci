# 변경 기록 / Changelog

이 프로젝트는 [Keep a Changelog](https://keepachangelog.com/)의 구조와 [Semantic Versioning](https://semver.org/) 원칙을 따릅니다.

## [Unreleased]

### 한국어

- 주석·스크립트·스타일·템플릿을 포커스 분석에서 제외하고 빈 `href`, `aria-disabled`, 대소문자가 다른 hidden 입력을 올바르게 처리합니다.
- 잘못된 `tabindex` 값을 `FT006`으로 탐지합니다.
- CLI 형식과 누락 옵션을 검증하고 중첩 출력 디렉터리를 지원합니다.
- GitHub Action 입력을 환경변수로 전달해 셸 명령 주입 경로를 제거했습니다.

### English

- Excludes comments, scripts, styles, and templates while correcting empty `href`, `aria-disabled`, and case-insensitive hidden-input semantics.
- Detects malformed `tabindex` values as `FT006`.
- Validates CLI formats and missing options and supports nested output directories.
- Passes Action inputs through environment variables, removing the shell-injection boundary.

### 검증 / Validation

- 4 regression tests, Node syntax checks, documented scan/compare examples, invalid-option failures, `npm pack --dry-run`, and GitHub Actions.

[Unreleased]: https://github.com/Kwondh0321/focustrail-ci/compare/v0.1.0...HEAD
