import districtList from "@/shared/data/korea_districts.json";
import { useMemo, useState } from "react";

export const SearchTab = ({ onSelectLocation }: { onSelectLocation: (location: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const searchResults = useMemo(() => {
    // 공백 제거 및 검색어 정규화
    const term = searchTerm.trim();
    if (term.length < 2) return [];

    // 검색어에서 공백을 제거하여 비교 (사용자가 '서울 종로'라고 쳐도 매칭되게)
    const normalizedTerm = term.replace(/\s+/g, "");

    return districtList
      .filter((address: string) => {
        // 데이터의 하이픈을 제거한 문자열에서 검색어가 포함되는지 확인
        const normalizedAddress = address.replace(/-/g, "");
        return normalizedAddress.includes(normalizedTerm);
      })
      .slice(0, 6) // ✨ 요구사항: 리스트를 6개로 제한
      .map((address: string) => {
        const parts = address.split("-");
        
        return {
          full: address,
          city: parts[0],
          // 상세 주소: 시/도를 제외한 나머지 전체
          sub: parts.slice(1).join(" "),
          // 가장 마지막 단위 지명
          mainName: parts[parts.length - 1]
        };
      });
  }, [searchTerm]);

  const hasNoResult = searchTerm.trim().length >= 2 && searchResults.length === 0;

  return (
    <section className="flex flex-col w-full max-w-2xl mx-auto p-6" aria-labelledby="search-title">
      <header>
        <h2 id="search-title" className="text-2xl font-black text-slate-800 mb-6">지역 검색</h2>
      </header>

      {/* 검색창 */}
      <form role="search" className="relative mb-6" onSubmit={(e) => e.preventDefault()}>
        <div className="flex items-center bg-slate-100 rounded-2xl px-5 h-16 border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all shadow-inner">
          <span className="text-xl mr-3" aria-hidden="true">🔍</span>
          <input
            type="search"
            placeholder="시, 구, 동, 면, 리 단위로 검색"
            className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </form>

      {/* 리스트 결과 영역 */}
      <div className="w-full">
        {searchResults.length > 0 ? (
          <ul className="space-y-2" role="listbox">
            {searchResults.map((result, index) => (
              <li key={index}>
                <button
                  onClick={() => onSelectLocation(result.full)}
                  className="w-full flex flex-col p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-800 group-hover:text-blue-600">
                      {result.mainName}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {result.city} {result.sub.replace(result.mainName, "").trim()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-tighter">
                    {result.full.replace(/-/g, " > ")}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          /* 결과 없음과 초기 가이드 모두 동일한 크기의 박스를 사용 */
          <div className="flex flex-col items-center justify-center min-h-[300px] py-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 px-6 text-center">
            {hasNoResult ? (
              /* 1. 결과 없음 상태 */
              <div role="alert" className="animate-in fade-in duration-300">
                <span className="text-4xl mb-4 block">📍</span>
                <p className="text-slate-600 font-black text-lg">해당 장소의 정보가 제공되지 않습니다.</p>
                <p className="text-slate-400 text-sm mt-1">다른 지역명을 입력해주세요.</p>
              </div>
            ) : (
              /* 2. 초기 가이드 상태 */
              <div className="animate-in fade-in duration-300">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 mx-auto">
                  <span className="text-2xl">🗺️</span>
                </div>
                <p className="text-slate-600 font-bold mb-2">지역을 검색해 보세요</p>
                <p className="text-slate-400 text-sm font-medium mb-5">
                  시, 구, 동, 면, 리 단위까지 검색 가능합니다.
                </p>
                <div className="flex gap-2 justify-center">
                  {["청운동", "보안면", "하입석리"].map((ex) => (
                    <span key={ex} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-500 font-bold shadow-sm">
                      "{ex}"
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};