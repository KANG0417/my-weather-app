// src/components/LoadingSpinner.tsx
export const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      {/* 빙글빙글 도는 애니메이션 원 */}
      <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
      
      {/* 로딩 메시지 */}
      <p className="mt-4 text-slate-500 font-medium animate-pulse">
        날씨 정보를 가져오고 있습니다...
      </p>
    </div>
  );
};