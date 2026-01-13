import { BaseModal } from "./BaseModal";

interface WeatherInfo {
  temp: string;
  minTemp: string;
  maxTemp: string;
  icon: string;
  humidity: string;
  baseTime: string;
  label: string;
  hourly: { 
    time: string; 
    temp: string; 
    icon: string;
    label: string;
  }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherInfo | null;
  locationName: string;
}

export const WeatherDetailModal = ({ isOpen, onClose, weather, locationName }: Props) => {
  if (!weather) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className="text-slate-800 cursor-default select-none">
        <header className="mb-6 text-center">
          <p className="text-blue-500 font-bold text-sm mb-1">상세 날씨 정보</p>
          <h3 className="text-2xl font-black">{locationName}</h3>
        </header>

        {/* 현재 온도 및 상태 */}
        <section className="flex items-center justify-around bg-slate-50 rounded-3xl p-6 mb-6">
          <span className="text-6xl">{weather.icon}</span>
          <div className="text-center">
            <div className="text-4xl font-black">{weather.temp}°</div>
            <p className="text-slate-500 font-bold">{weather.label}</p>
          </div>
        </section>

        {/* 시간별 예보 */}
        <section className="mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 ml-1">시간대별 기온</h4>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {weather.hourly.map((h, i) => (
              <div key={i} className="flex flex-col items-center min-w-[60px] bg-slate-100 p-3 rounded-2xl">
                <span className="text-[10px] text-slate-500 mb-1">{h.time}</span>
                <span className="text-xl mb-1">{h.icon}</span>
                <span className="text-sm font-bold">{h.temp}°</span>
              </div>
            ))}
          </div>
        </section>

        <button 
          onClick={onClose}
          className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl hover:bg-slate-900 transition-all"
        >
          닫기
        </button>
      </div>
    </BaseModal>
  );
};