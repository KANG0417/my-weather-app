import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { convertToNxNy } from "./utils/geoConvert";
import { getWeatherData } from "./api/weather";

type TabType = "search" | "current" | "favorites";

const App: React.FC = () => {
  const handleFindLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lon: longitude });

      // 💡 여기서 기상청 좌표로 변환!
      const { nx, ny } = convertToNxNy(latitude, longitude);
      setGrid({ nx, ny });
    });
  };
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [grid, setGrid] = useState<{ nx: number; ny: number } | null>(null);
  const [weatherParsed, setWeatherParsed] = useState<{ time: string; data: Record<string, string> } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  //const state = useGeolocation();
  const [activeTab, setActiveTab] = useState<TabType>("current");

  useEffect(() => {
    if (!grid) return;
    const fetchWeather = async () => {
      setLoadingWeather(true);
      setWeatherError(null);
      try {
        const items = await getWeatherData(grid.nx, grid.ny);
        if (!items) {
          setWeatherError("날씨정보를 가져오지 못했습니다.");
          setLoadingWeather(false);
          return;
        }
        const parsed = parseForecast(items);
        setWeatherParsed(parsed);
      } catch {
        setWeatherError("네트워크 에러가 발생했습니다.");
      } finally {
        setLoadingWeather(false);
      }
    };
    fetchWeather();
  }, [grid]);

  const parseForecast = (items: Array<{ category: string; fcstValue: string; fcstDate: string; fcstTime: string }>) => {
    if (!items || items.length === 0) return null;
    const now = new Date();
    const nowStr = now.toISOString().slice(0,10).replace(/-/g,'') + ('00' + now.getHours()).slice(-2) + ('00' + now.getMinutes()).slice(-2);
    const times = Array.from(new Set(items.map(i => i.fcstDate + i.fcstTime))).sort();
    let chosen = times.find(t => t >= nowStr);
    if (!chosen) chosen = times[times.length - 1];
    const chosenItems = items.filter(i => (i.fcstDate + i.fcstTime) === chosen);
    const map: Record<string, string> = {};
    chosenItems.forEach(i => (map[i.category] = i.fcstValue));
    return { time: chosen, data: map };
  };

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.2 },
  };

  return (
    /* 1. items-center: 자식들을 가로 중앙으로 배치 / w-full: 화면 꽉 채움 */
    <div className="flex flex-col w-full min-h-screen items-center bg-slate-50 font-sans">
      {/* 2. Header: w-full을 주고 내부 요소를 중앙 정렬 */}
      <header className="w-full flex justify-center py-10">
        <h1 className="font-title text-5xl text-blue-600">날씨요정</h1>
      </header>

      {/* 3. Navigation: 둥근 캡슐 스타일 유지 및 중앙 배치 */}
      <nav className="flex items-center justify-between w-[90%] max-w-md bg-blue-600 p-1.5 rounded-full shadow-lg mb-10">
        <TabButton
          label="검색"
          icon="🔍"
          isActive={activeTab === "search"}
          onClick={() => setActiveTab("search")}
        />
        <TabButton
          label="내 위치"
          icon="📍"
          isActive={activeTab === "current"}
          onClick={() => setActiveTab("current")}
        />
        <TabButton
          label="좋아요"
          icon="⭐"
          isActive={activeTab === "favorites"}
          onClick={() => setActiveTab("favorites")}
        />
      </nav>

      {/* 4. Main Content: 너비를 반응형으로 설정하고 중앙 정렬 */}
      <main className="w-full max-w-4xl px-4 flex justify-center">
        <div className="w-full bg-white rounded-[2.5rem] shadow-xl p-10 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              {...tabVariants}
              className="w-full flex flex-col items-center justify-center text-center"
            >
              {activeTab === "search" && (
                <div>
                  <h2 className="text-3xl font-bold mb-4">🔍 도시 검색</h2>
                  <p className="text-slate-500">찾고 싶은 도시를 입력하세요.</p>
                </div>
              )}

              {activeTab === "current" && (
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-3xl font-bold text-blue-600">
                    📍 현재 위치 좌표
                  </h2>

                  {grid ? (
                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                      <div className="bg-blue-600 text-white p-6 rounded-3xl text-center shadow-lg">
                        <p className="text-sm opacity-80">기상청 NX</p>
                        <p className="text-4xl font-black">{grid.nx}</p>
                      </div>
                      <div className="bg-blue-600 text-white p-6 rounded-3xl text-center shadow-lg">
                        <p className="text-sm opacity-80">기상청 NY</p>
                        <p className="text-4xl font-black">{grid.ny}</p>
                      </div>
                      <div className="col-span-2 text-slate-400 text-sm">
                        브라우저 좌표: {coords?.lat.toFixed(3)}, {coords?.lon.toFixed(3)}
                      </div>

                      {/* 날씨 정보 영역 */}
                      <div className="col-span-2 mt-2 w-full">
                        {loadingWeather ? (
                          <div className="text-center text-sm text-slate-500">날씨 정보를 불러오는 중…</div>
                        ) : weatherError ? (
                          <div className="text-center text-sm text-red-500">{weatherError}</div>
                        ) : weatherParsed ? (
                          (() => {
                            const ptyMap: Record<string,string> = { '0':'없음','1':'비','2':'비/눈','3':'눈','4':'소나기' };
                            const skyMap: Record<string,string> = { '1':'맑음','3':'구름많음','4':'흐림' };
                            const data = weatherParsed.data;
                            return (
                              <div className="bg-slate-100 p-4 rounded-2xl text-left">
                                <div className="text-sm text-slate-500">예측 시각: {weatherParsed.time.slice(0,8)} {weatherParsed.time.slice(8,12)}</div>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <div className="text-xs text-slate-400">기온</div>
                                    <div className="text-xl font-bold">{data.T1H ?? '-'}℃</div>
                                  </div>
                                  <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <div className="text-xs text-slate-400">강수확률</div>
                                    <div className="text-xl font-bold">{data.POP ?? '-'}%</div>
                                  </div>
                                  <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <div className="text-xs text-slate-400">강수형태</div>
                                    <div className="text-lg font-semibold">{ptyMap[data.PTY ?? '0']}</div>
                                  </div>
                                  <div className="p-3 bg-white rounded-xl shadow-sm">
                                    <div className="text-xs text-slate-400">하늘상태</div>
                                    <div className="text-lg font-semibold">{skyMap[data.SKY ?? '1']}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="text-center text-sm text-slate-500">예상 정보를 준비 중입니다.</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleFindLocation}
                      className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold"
                    >
                      내 위치 좌표 찾기
                    </button>
                  )}
                </div>
              )}

              {activeTab === "favorites" && (
                <div>
                  <h2 className="text-3xl font-bold mb-4">⭐ 즐겨찾기</h2>
                  <p className="text-slate-500 text-lg">
                    저장된 도시 리스트입니다.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// 탭 버튼 컴포넌트 (텍스트 색상 및 배경 로직 유지)
const TabButton: React.FC<TabButtonProps> = ({
  label,
  icon,
  isActive,
  onClick,
}) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={` ${isActive ? "text-blue-600 font-bold" : "text-white/80"}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-xs">{label}</span>
    {isActive && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
      />
    )}
  </motion.button>
);

interface TabButtonProps {
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

export default App;
