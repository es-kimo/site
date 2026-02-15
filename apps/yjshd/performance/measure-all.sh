#!/bin/bash

# 모든 주요 페이지 일괄 측정
# 사용법: ./measure-all.sh [before|after]

STAGE=${1:-"before"}

echo "📊 yjshd 전체 페이지 성능 측정"
echo "================================"
echo "Stage: $STAGE"
echo ""

# 측정할 페이지 목록
PAGES=(
  "/"
  "/1.소개"
  "/1.소개/1.의료진%20소개"
  "/4.게시판"
)

for page in "${PAGES[@]}"; do
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ./performance/measure.sh "$STAGE" "$page"
  echo ""
  sleep 2  # 측정 사이 간격
done

echo ""
echo "✅ 전체 측정 완료!"
echo "📁 결과: ./performance/reports/"
