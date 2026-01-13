import { useState } from "react";
import FavoriteBeforeIcon from "@/assets/icons/FavoriteBeforeIcon.png";
import FavoriteAfterIcon from "@/assets/icons/FavoriteAfterIcon.png";
import { useWeather } from "@/api/useWeather";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import regions from "@/shared/data/regions.json";
import { WeatherDetailModal } from "../modal/WeatherDetailModal";

interface FavoriteItem {
  full: string;
  mainName: string;
}

const FavoriteCard = ({ item, onRemove }: { item: FavoriteItem; onRemove: (full: string) => void }) => {
  const addrParts = item.full.split("-");
  const matched = regions.find(
    (r) =>
      r.city === addrParts[0] &&
      (r.gu === (addrParts[1] || "")) &&
      (r.dong === (addrParts[2] || ""))
  );

  // ✅ 이제 useWeather가 인수를 받으므로 에러가 사라집니다.
  const { weather, loading } = useWeather(matched ? { nx: matched.nx, ny: matched.ny } : undefined);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  if (!weather || !weather.temp) return <div className="p-10 text-center">날씨 정보를 불러올 수 없습니다.</div>;

  return (
    <article className="relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all min-h-[160px] flex flex-col justify-between cursor-pointer"
        onClick={() => setIsDetailOpen(true)}>
          <WeatherDetailModal
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        weather={weather}
        locationName={item.mainName}
      />
      <button onClick={() => onRemove(item.full)} className="absolute top-5 right-5 z-10 active:scale-75 transition-transform">
        <img src={FavoriteAfterIcon} className="w-7 h-7" alt="Remove" />
      </button>

      {loading ? (
        <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
      ) : weather ? (
        <>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-black text-slate-800">{item.mainName}</h3>
              <p className="text-[10px] text-slate-400 mt-1">{item.full.replace(/-/g, " ")}</p>
            </div>
            <div className="flex flex-col items-end mr-8">
              <span className="text-4xl mb-1">{weather.icon}</span>
              <span className="text-2xl font-black text-slate-700">{weather.temp}°</span>
            </div>
          </div>
          <div className="flex gap-3 mt-4 pt-4 border-t border-slate-50">
            <div className="flex items-center gap-1">
              <span className="text-blue-400 text-xs font-bold">↓</span>
              <span className="text-sm font-bold text-slate-600">{weather.minTemp}°</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-400 text-xs font-bold">↑</span>
              <span className="text-sm font-bold text-slate-600">{weather.maxTemp}°</span>
            </div>
          </div>
        </>
      ) : null}
    </article>
  );
};

export const FavoritesTab = () => {
  // ✅ Lazy Initializer를 사용하여 setState 경고 해결
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem("weather_favorites");
    if (!saved) return [];
    try {
      return JSON.parse(saved).slice(0, 6);
    } catch {
      return [];
    }
  });

  const removeFavorite = (full: string) => {
    const updated = favorites.filter((item) => item.full !== full);
    setFavorites(updated);
    localStorage.setItem("weather_favorites", JSON.stringify(updated));
  };

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[400px]">
        <h2 className="text-2xl font-bold mb-10 text-[#F59E0B]">즐겨찾기</h2>
        <div className="mb-10 grayscale opacity-20 transform scale-[2.5]">
          <img src={FavoriteBeforeIcon} alt="Empty" className="w-10 h-10" />
        </div>
        <p className="text-slate-400 font-medium">아직 즐겨찾기한 지역이 없어요.</p>
      </div>
    );
  }

  return (
      <div className="w-full max-w-5xl mx-auto p-4"> {/* max-w를 늘려야 3개가 들어갈 공간이 넉넉합니다 */}
        <header className="flex justify-between items-end mb-8 px-2">
          <h2 className="text-2xl font-bold text-[#F59E0B]">즐겨찾기 목록</h2>
          <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {favorites.length} / 6
          </span>
        </header>
        
        {/* ✅ 반응형 그리드 설정 변경 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((item, index) => (
            <FavoriteCard key={index} item={item} onRemove={removeFavorite} />
          ))}
        </div>
      </div>
    );
};