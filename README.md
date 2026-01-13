import districtListRaw from "@/shared/data/korea_districts.json";
import { useMemo, useState } from "react";

const districtList = districtListRaw as string[];

interface SearchResult {
  full: string;
  city: string;
  sub: string;
  mainName: string;
}

interface WeatherInfo {
  temp: number;
  condition: string;
  humidity: number;
  icon: string;
}

export const SearchTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [displayResults, setDisplayResults] = useState<SearchResult[]>([]);

  // 1. 실시간 필터링 함수 (공통 사용을 위해 분리)
  const getFilteredData = (term: string): SearchResult[] => {
    const normalizedTerm = term.trim().replace(/\s+/g, "");
    if (normalizedTerm.length < 2) return [];

    return districtList
      .filter((addr) => addr.replace(/-/g, "").includes(normalizedTerm))
      .slice(0, 10)
      .map((addr) => {
        const parts = addr.split("-");
        return {
          full: addr,
          city: parts[0] || "",
          sub: parts.slice(1).join(" "),
          mainName: parts[parts.length - 1] || ""
        };
      });
  };

  // 2. 실시간 자동완성 리스트 (useMemo)
  const currentFiltered = useMemo(() => getFilteredData(searchTerm), [searchTerm]);

  if (currentFiltered.length > 0 && currentFiltered !== displayResults) {
    setDisplayResults(currentFiltered);
  }

  // 3. 날씨 조회 함수
  const fetchWeather = (result: SearchResult) => {
    setSearchTerm(result.mainName);
    setIsSelected(true);
    setIsSubmitted(false);
    setSelectedLocation(result);
    setDisplayResults([]); // 선택 시 리스트 닫기
    // 시뮬레이션 데이터
    setWeather({ temp: 18, condition: "맑음", humidity: 42, icon: "☀️" });
  };

  // 4. ✨ 핵심 수정: 검색 버튼/엔터 클릭 시 로직
  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const term = searchTerm.trim();
    
    // 최소 글자 수 미달 시 초기화
    if (term.length < 2) {
      setSelectedLocation(null);
      setWeather(null);
      setDisplayResults([]);
      setIsSubmitted(false);
      return;
    }

    // 🔍 버튼 누르는 시점에 최신 필터 결과 가져오기
    const resultsAtSubmit = getFilteredData(term);

    if (resultsAtSubmit.length > 0) {
      // 1. 입력값과 동 이름(mainName)이 완전히 일치하는 것 찾기
      const exactMatch = resultsAtSubmit.find(item => item.mainName === term);
      // 2. 없으면 가장 첫 번째 검색 결과 선택
      const target = exactMatch || resultsAtSubmit[0];
      
      fetchWeather(target);
    } else {
      // 결과가 아예 없는 경우
      setSelectedLocation(null);
      setWeather(null);
      setDisplayResults([]);
      setIsSubmitted(true); // "정보 없음" 메시지 트리거
    }
  };

  return (
    <section className="flex flex-col w-full max-w-2xl mx-auto p-6 space-y-6">
      <header>
        <h2 className="text-2xl font-black text-slate-800">지역 날씨 검색</h2>
      </header>

      <form onSubmit={handleSearchSubmit} className="relative">
        <fieldset className="flex items-center bg-slate-100 rounded-2xl px-5 h-16 border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all shadow-inner">
          <legend className="sr-only">지역 검색</legend>
          <button type="submit" className="text-xl mr-3 hover:scale-110 transition-transform">🔍</button>
          <input
            type="search"
            placeholder="동네 이름을 입력하세요"
            className="w-full bg-transparent outline-none font-bold text-slate-700"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSelected(false);
              setIsSubmitted(false); 
              if (e.target.value.trim().length < 2) setDisplayResults([]);
            }}
          />
        </fieldset>

        {/* 자동완성 리스트 (검색 전/입력 중에만 노출) */}
        {!isSelected && !isSubmitted && displayResults.length > 0 && (
          <nav className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
            <ul>
              {displayResults.slice(0, 4).map((result, index) => (
                <li key={index} className="border-b border-slate-50 last:border-none">
                  <button
                    type="button"
                    onClick={() => fetchWeather(result)}
                    className="w-full p-4 text-left hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <strong className="font-bold text-slate-800">{result.mainName}</strong>
                      <small className="text-[10px] text-slate-400 uppercase tracking-tighter">
                        {result.full.replace(/-/g, " > ")}
                      </small>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </form>

      {/* ⚠️ 결과 없음 알림 */}
      {isSubmitted && !selectedLocation && (
        <aside className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 px-6 text-center animate-in fade-in zoom-in-95 duration-300">
          <span className="text-4xl mb-4" aria-hidden="true">📍</span>
          <p className="text-slate-600 font-black text-lg">해당 장소의 정보가 제공되지 않습니다.</p>
        </aside>
      )}

      {/* ☀️ 날씨 상세 정보 카드 */}
      {selectedLocation && weather && (
        <article className="w-full bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl animate-in slide-in-from-bottom-4 duration-500">
          <header className="mb-6">
            <p className="text-blue-100 text-sm font-medium">{selectedLocation.full.replace(/-/g, " / ")}</p>
            <h3 className="text-4xl font-black mt-1">{selectedLocation.mainName}</h3>
          </header>
          
          <div className="flex justify-between items-end">
            <section>
              <p className="text-6xl font-black tracking-tighter">{weather.temp}°</p>
              <p className="text-xl font-bold mt-2">{weather.condition}</p>
            </section>
            <span className="text-6xl mb-2 block" role="img" aria-label={weather.condition}>{weather.icon}</span>
          </div>
        </article>
      )}
    </section>
  );
};