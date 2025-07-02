#!/bin/bash

# RSShub to MDX Converter Script
# Usage: ./scripts/inspiration.sh [options]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 RSShub to MDX Converter${NC}"
echo -e "${BLUE}================================${NC}"

# 패키지 빌드
echo -e "${YELLOW}📦 Building rsshub-to-mdx package...${NC}"
pnpm -F @repo/rsshub-to-mdx build

# 기본 설정
USERNAME="ryurlah"
OUTPUT_DIR="./apps/blog/content/inspiration"
INCLUDE_RETWEETS=true
RSSHUB_URL="http://localhost:1200"

# 인자 파싱
while [[ $# -gt 0 ]]; do
  case $1 in
    --username)
      USERNAME="$2"
      shift 2
      ;;
    --output-dir)
      OUTPUT_DIR="$2"
      shift 2
      ;;
    --no-retweets)
      INCLUDE_RETWEETS=false
      shift
      ;;
    --rsshub-url)
      RSSHUB_URL="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --username USER      Twitter username (default: ryurlah)"
      echo "  --output-dir DIR     Output directory (default: ./apps/blog/content/inspiration)"
      echo "  --no-retweets        Exclude retweets"
      echo "  --rsshub-url URL     RSShub URL (default: http://localhost:1200)"
      echo "  -h, --help           Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                                    # Basic usage"
      echo "  $0 --no-retweets                     # Exclude retweets"
      echo "  $0 --username other_user             # Different user"
      exit 0
      ;;
    *)
      echo -e "${RED}❌ Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# 실행 정보 출력
echo -e "${BLUE}📋 Configuration:${NC}"
echo -e "  Username: ${GREEN}$USERNAME${NC}"
echo -e "  Output Dir: ${GREEN}$OUTPUT_DIR${NC}"
echo -e "  Include Retweets: ${GREEN}$INCLUDE_RETWEETS${NC}"
echo -e "  RSShub URL: ${GREEN}$RSSHUB_URL${NC}"
echo ""

# 명령어 구성
CMD="node packages/rsshub-to-mdx/dist/cli.js $USERNAME --output-dir $OUTPUT_DIR --rsshub-url $RSSHUB_URL"

if [ "$INCLUDE_RETWEETS" = false ]; then
  CMD="$CMD --no-retweets"
fi

# 실행
echo -e "${YELLOW}🔄 Fetching and converting tweets...${NC}"
eval $CMD

echo -e "${GREEN}✅ Done!${NC}" 