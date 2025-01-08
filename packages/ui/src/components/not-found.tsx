export default function NotFound() {
  return (
    <div className="h-[calc(100vh-var(--header-h))] relative">
      <div className="w-fit m-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <h2 className="inline-block mr-5 pr-6 text-2xl font-medium align-top leading-[49px] border-r-[1px]">404</h2>
        <h3 className="inline-block text-sm leading-[49px]">요청하신 페이지를 찾을 수 없습니다.</h3>
      </div>
    </div>
  );
}
