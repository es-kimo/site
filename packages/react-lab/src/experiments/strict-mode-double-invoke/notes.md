# StrictMode는 무엇을 두 번 부르고 무엇을 두 번 부르지 않는가

## 실험 방법

StrictMode를 끈 상태와 켠 상태로 각각 마운트해서 콘솔 패널의 순번과 커밋 패널의 개수를 비교한다.
그다음 업데이트 / Child 언마운트를 눌러 마운트 이후에도 이중 호출이 이어지는지 본다.

## 관찰

| | StrictMode OFF | StrictMode ON |
| --- | --- | --- |
| 첫 마운트 render 로그 | | |
| 첫 마운트 effect 로그 | | |
| 커밋 개수 | | |
| 업데이트 시 render 로그 | | |
| RenderBadge 숫자 | | |

## 왜 그런가

## 결론

(정리되면 meta.ts의 `finding`에 한 줄로 옮긴다)
