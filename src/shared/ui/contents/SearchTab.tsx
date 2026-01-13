import { useState, useMemo } from "react";
import districtListRaw from "@/shared/data/korea_districts.json";
import regions from "@/shared/data/regions.json"; 
import FavoriteBeforeIcon from "@/assets/icons/FavoriteBeforeIcon.png"; 
import FavoriteAfterIcon from "@/assets/icons/FavoriteAfterIcon.png";
import { fetchWeather, type WeatherItem } from "@/api/weatherApi";
import { getWeatherStatus } from "@/shared/lib/getWeatherStatus";
import { AlertModal } from "../modal/AlertModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SearchBar } from "./SearchBar";

const districtList = districtListRaw as string[];

interface SearchResult {
  full: string;
  city: string;
  sub: string;
  mainName: string;
}

interface WeatherInfo {
  temp: string;
  minTemp: string;
  maxTemp: string;
  condition: string;
  icon: string;
  humidity: string;
  baseTime: string;
  hourly: { 
    time: string; 
    temp: string; 
    icon: string;
    label: string;
  }[];
}

interface SearchTabProps {
  onSelectLocation?: (location: string) => void;
}

export const SearchTab = ({ onSelectLocation }: SearchTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [tick, setTick] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const filteredResults = useMemo(() => {
    const normalized = searchTerm.trim().replace(/\s+/g, "");
    if (normalized.length === 0) return [];
    const cleanAddr = (addr: string) => addr.replace(/-/g, "");
    let matches = districtList.filter((addr) => cleanAddr(addr).includes(normalized));
    if (matches.length === 0 && normalized.length >= 2) {
      const alt = normalized.slice(0, -1);
      matches = districtList.filter((addr) => cleanAddr(addr).includes(alt));
    }
    return matches.slice(0, 4).map((addr) => {
      const parts = addr.split("-");
      return {
        full: addr,
        city: parts[0] || "",
        sub: parts.slice(1).join(" "),
        mainName: parts[parts.length - 1] || "",
      } as SearchResult;
    });
  }, [searchTerm]);

  const handleSelect = async (result: SearchResult) => {
    setSearchTerm(result.mainName);
    setSelectedLocation(result);
    setIsSubmitted(false);
    setIsLoading(true); // ✅ 날씨 호출 전 로딩 시작

    try {
      const addrParts = result.full.split("-");
      const matchedRegion = regions.find(r => 
        r.city === addrParts[0] && 
        (r.gu === (addrParts[1] || "")) && 
        (r.dong === (addrParts[2] || ""))
      ) || regions.find(r => r.nx !== undefined && result.full.includes(r.dong));

      if (!matchedRegion) {
        setIsLoading(false); // ✅ 지역 매칭 실패 시 로딩 종료
        return;
      }

      const { nx, ny } = matchedRegion;
      const { items, displayTime } = await fetchWeather(nx, ny);

      const currentTemp = items.find((i: WeatherItem) => i.category === "TMP")?.fcstValue || "0";
      const minTemp = items.find((i: WeatherItem) => i.category === "TMN")?.fcstValue || "-";
      const maxTemp = items.find((i: WeatherItem) => i.category === "TMX")?.fcstValue || "-";

      const hourlyForecast = items
        .filter((i: WeatherItem) => i.category === "TMP")
        .slice(0, 12)
        .map((i: WeatherItem) => {
          const hourSky = items.find((item: WeatherItem) => item.fcstTime === i.fcstTime && item.fcstDate === i.fcstDate && item.category === "SKY")?.fcstValue || "1";
          const hourPty = items.find((item: WeatherItem) => item.fcstTime === i.fcstTime && item.fcstDate === i.fcstDate && item.category === "PTY")?.fcstValue || "0";
          const status = getWeatherStatus(hourSky, hourPty);
          return {
            time: i.fcstTime.slice(0, 2) + "시",
            temp: i.fcstValue,
            icon: status.icon,
            label: status.label
          };
        });

      const currentStatus = getWeatherStatus(
        items.find((i: WeatherItem) => i.category === "SKY")?.fcstValue || "1",
        items.find((i: WeatherItem) => i.category === "PTY")?.fcstValue || "0"
      );

      setWeather({
        temp: currentTemp,
        minTemp: minTemp,
        maxTemp: maxTemp,
        condition: currentStatus.label,
        icon: currentStatus.icon,
        humidity: items.find((i: WeatherItem) => i.category === "REH")?.fcstValue || "0",
        baseTime: displayTime,
        hourly: hourlyForecast,
      });

      if (onSelectLocation) onSelectLocation(result.full);
    } catch (err) {
      console.error("날씨 호출 실패:", err);
    } finally {
      setIsLoading(false); // ✅ 성공하든 실패하든 마지막에 로딩 종료
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const term = searchTerm.trim();
    if (term.length === 0) {
      setSearchTerm(""); setSelectedLocation(null); setWeather(null); setIsSubmitted(false);
      return;
    }
    if (filteredResults.length > 0) handleSelect(filteredResults[0]);
    else { setIsSubmitted(true); setSelectedLocation(null); }
  };

  const isFavorite = useMemo(() => {
    if (!selectedLocation) return false;
    const saved = localStorage.getItem("weather_favorites");
    if (!saved) return false;
    try {
      const favorites: SearchResult[] = JSON.parse(saved);
      return favorites.some((fav) => fav.full === selectedLocation.full);
    } catch { return false; }
  }, [selectedLocation, tick]); 

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedLocation) return;
    
    const saved = localStorage.getItem("weather_favorites");
    let favorites: SearchResult[] = saved ? JSON.parse(saved) : [];
    const isCurrentlyFav = favorites.some((fav) => fav.full === selectedLocation.full);
    
    if (isCurrentlyFav) {
      // 삭제는 항상 허용
      favorites = favorites.filter((fav) => fav.full !== selectedLocation.full);
    } else {
      // ✅ 추가할 때만 6개 체크
      if (favorites.length >= 6) {
        setShowModal(true); // 6개 이상이면 모달 오픈
        return;
      }
      favorites.push(selectedLocation);
    }
    
    localStorage.setItem("weather_favorites", JSON.stringify(favorites));
    setTick(prev => prev + 1);
  };

  return (
    <section className="w-full flex flex-col items-center space-y-4">
      <AlertModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <form onSubmit={handleSearchSubmit} className="w-full max-w-xl relative">
        <fieldset className="flex items-center bg-slate-100 rounded-3xl px-6 h-16 border-2 border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all shadow-inner">
          <button type="submit" className="text-xl mr-3">🔍</button>
          <SearchBar value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setIsSubmitted(false); }} />
        </fieldset>

        {filteredResults.length > 0 && searchTerm !== selectedLocation?.mainName && (
          <ul className="absolute z-30 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            {filteredResults.map((result, idx) => (
              <li key={idx}>
                <button type="button" onClick={() => handleSelect(result)} className="w-full px-6 py-4 text-left hover:bg-blue-50 flex justify-between items-center transition-colors group">
                  <span className="font-bold text-slate-700 group-hover:text-blue-600">{result.mainName}</span>
                  <span className="text-[10px] text-slate-400 uppercase">{result.full.replace(/-/g, " > ")}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </form>

      <main className="w-full flex justify-center pt-4 min-h-[400px]"> {/* 로딩 시 높이 변화 최소화 */}
        {isLoading ? (
          // 데이터 불러오는 중일 때 표시
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner />
            <p className="mt-4 text-slate-400 font-bold animate-pulse">
              날씨 정보를 불러오고 있습니다...
            </p>
          </div>
        ) : selectedLocation && weather ? (
          // 로딩이 끝나고 데이터가 있을 때 (기존 카드 UI)
          <article className="w-full max-w-lg bg-gradient-to-br from-blue-600 to-blue-400 rounded-[3rem] p-8 text-white shadow-2xl relative animate-in zoom-in-95 duration-300">
            
            <button 
              onClick={toggleFavorite} 
              className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center z-30 transition-opacity active:opacity-70"
            >
              <img 
                src={isFavorite ? FavoriteAfterIcon : FavoriteBeforeIcon} 
                className="w-10 h-10 object-contain" 
                alt="favorite"
              />
            </button>

            <header className="mb-8">
              <p className="text-blue-100 text-sm font-medium opacity-80 mb-1">
                {selectedLocation.full.replace(/-/g, " ")}
              </p>
              <h3 className="text-4xl font-black leading-tight">
                {selectedLocation.mainName}
              </h3>
            </header>
            
            <section className="flex flex-col items-center mb-8">
              <span className="text-8xl mb-4">{weather.icon}</span>
              <div className="text-7xl font-black flex items-start">
                {weather.temp}<span className="text-3xl mt-3 ml-1 text-blue-200">°</span>
              </div>
              <div className="flex gap-4 text-lg font-bold mt-2 text-blue-50">
                <span className="flex items-center gap-1">
                  <span className="text-blue-200">↓ 최저</span> {weather.minTemp}°
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-red-300">↑ 최고</span> {weather.maxTemp}°
                </span>
              </div>
            </section>

            <section className="w-full bg-white/10 backdrop-blur-md rounded-[2rem] p-5 mb-8">
              <h4 className="text-xs md:text-lg lg:text-lg font-black text-blue-100 uppercase mb-4 ml-2 tracking-widest opacity-70">
                시간대별 기온
              </h4>
              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide px-1">
                {weather.hourly.map((item, index) => (
                  <div key={index} className="flex flex-col items-center min-w-[60px] bg-white/10 p-3 rounded-2xl border border-white/5 shadow-sm">
                    <time className="text-[10px] text-blue-100 mb-2 font-medium opacity-80">{item.time}</time>
                    <span className="text-2xl mb-2">{item.icon}</span>
                    <span className="text-lg font-bold">{item.temp}°</span>
                  </div>
                ))}
              </div>
            </section>

            <footer className="flex gap-10 border-t border-white/10 pt-6 w-full justify-center">
              <div className="text-center">
                <h5 className="text-xs text-blue-100 font-bold mb-1 opacity-70">상태</h5>
                <p className="text-lg font-extrabold">{weather.condition}</p>
              </div>
              <div className="text-center">
                <h5 className="text-xs text-blue-100 font-bold mb-1 opacity-70">습도</h5>
                <p className="text-lg font-extrabold">{weather.humidity}%</p>
              </div>
            </footer>
          </article>
        ) : (
          // 3️⃣ 검색 결과가 없을 때
          isSubmitted && (
            <aside className="py-16 text-center text-slate-400">
              <span className="text-5xl block mb-4 animate-bounce">📍</span>
              <p className="font-bold text-lg">해당 장소의 정보가 없습니다.</p>
            </aside>
          )
        )}
      </main>
    </section>
  );
};