#!/bin/bash

# yjshd 성능 측정 스크립트
# 사용법: ./measure.sh [before|after] [페이지경로]

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
STAGE=${1:-"before"}
PAGE=${2:-"/"}
OUTPUT_DIR="./performance/reports"

mkdir -p "$OUTPUT_DIR"

echo "🔍 성능 측정 시작: $STAGE"
echo "📄 대상 페이지: $PAGE"
echo "⏰ 시간: $TIMESTAMP"
echo ""

# Lighthouse 측정 (프로덕션 서버가 실행 중이어야 함)
echo "🚀 Lighthouse 측정 중..."

# 페이지 경로에서 파일명 생성 (/ -> _root, /1.소개 -> _1.소개)
PAGE_NAME=$(echo "$PAGE" | sed 's/\//_/g' | sed 's/^_//')
[ -z "$PAGE_NAME" ] && PAGE_NAME="root"

OUTPUT_FILE="$OUTPUT_DIR/${STAGE}_${PAGE_NAME}_${TIMESTAMP}"

npx lighthouse "http://localhost:3000${PAGE}" \
  --output=json,html \
  --output-path="$OUTPUT_FILE" \
  --chrome-flags="--headless" \
  --only-categories=performance,accessibility,best-practices,seo \
  2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ 측정 완료!"
  echo "📁 JSON: ${OUTPUT_FILE}.report.json"
  echo "📁 HTML: ${OUTPUT_FILE}.report.html"
  echo ""
  
  # JSON에서 주요 지표 추출
  echo "📊 주요 지표:"
  node -e "
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync('${OUTPUT_FILE}.report.json'));
    const perf = data.categories.performance.score * 100;
    const fcp = data.audits['first-contentful-paint'].numericValue;
    const lcp = data.audits['largest-contentful-paint'].numericValue;
    const tbt = data.audits['total-blocking-time'].numericValue;
    const cls = data.audits['cumulative-layout-shift'].numericValue;
    const ttfb = data.audits['server-response-time'].numericValue;
    
    console.log('Performance Score:', perf.toFixed(0));
    console.log('TTFB:', ttfb.toFixed(0), 'ms');
    console.log('FCP:', fcp.toFixed(0), 'ms');
    console.log('LCP:', lcp.toFixed(0), 'ms');
    console.log('TBT:', tbt.toFixed(0), 'ms');
    console.log('CLS:', cls.toFixed(3));
  "
else
  echo "❌ 측정 실패. 서버가 실행 중인지 확인하세요."
  echo "   pnpm build --filter=yjshd && pnpm start --filter=yjshd"
fi
