import { useWeather } from "@/api/useWeather";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export const CurrentTab = () => {
  const { weather, loading } = useWeather();

  if (loading || !weather) return <LoadingSpinner />;

  return (
    // <article>은 하나의 완성된 독립적인 콘텐츠(날씨 정보)를 의미합니다.
    <article className="flex flex-col items-center w-full pt-8 lg:pb-8 lg:pl-6 lg:pr-6">
      
      {/* 1. 위치와 정보, city만 존재할 경우 상단에 내위치 및 city만 표시 전부 있을 경우 city, dong, gu 표시  */}
      <header className="text-center mb-10">
        <p className="text-slate-400 text-s md:text-lg lg:text-lg lg:mb-2 font-medium">
          {weather.location.gu
            ? `${weather.location.city} ${weather.location.gu}` 
            : '내 위치'}
        </p>
        <h2 className="text-4xl lg:text-6xl font-black text-slate-800 tracking-tight">
          {weather.location.dong || weather.location.gu || weather.location.city}
        </h2>
      </header>

      {/* 2. 현재 주요 기상 정보 */}
      <section className="flex flex-col items-center mb-15" aria-label="현재 기상 정보">
        <figure className="flex flex-col items-center">
          <span className="text-9xl mb-8" role="img" aria-label={weather.label}>
            {weather.icon}
          </span>
          <div className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-black leading-none text-slate-900 flex items-start">
            {weather.temp}<span className="text-s lg:text-[8rem] lg:mt-6 lg:ml-1 text-blue-500" aria-label="도">°</span>
          </div>
          <figcaption className="sr-only">{weather.label} 상태이며 온도는 {weather.temp}도입니다.</figcaption>
        </figure>

        <div className="flex gap-4 text-lg font-bold mt-2">
          <span className="text-blue-500">↓ <span>최저</span> {weather.minTemp}°</span>
          <span className="text-red-500">↑ <span>최고</span> {weather.maxTemp}°</span>
        </div>
      </section>

      {/* 3. 섹션: 시간대별 예보 */}
      <section className="w-full bg-slate-50 rounded-[2.5rem] p-6 mb-8" aria-labelledby="hourly-title">
        <h3 id="hourly-title" className="text-xs font-black text-slate-400 uppercase mb-4 ml-2 tracking-widest">
          시간대별 기온
        </h3>
        <div className="flex overflow-x-auto gap-6 pb-2 scrollbar-hide">
          {weather.hourly.map((item, index) => (
            // 각 시간 단위 예보는 <section> 혹은 <div>로 구성
            <div 
              key={index} 
              className="flex flex-col items-center min-w-[70px] bg-white/40 backdrop-blur-sm p-4 rounded-3xl border border-white/20 shadow-sm"
            >
              <time className="text-xs text-slate-500 mb-3 font-medium">
                {item.time}
              </time>
              <span className="text-3xl mb-3 filter drop-shadow-sm" role="img" aria-label={item.label}>
                {item.icon}
              </span>
              <span className="text-2xl font-black text-slate-800">
                {item.temp}°
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 푸터: 부가적인 기상 정보 */}
      <footer className="flex gap-12 border-t border-slate-100 pt-8 w-full justify-center">
        <section className="text-center">
          <h4 className="text-2xl text-slate-400 font-bold mb-1 uppercase">날씨상태</h4>
          <p className="text-xl font-bold text-slate-700">{weather.label}</p>
        </section>
        <section className="text-center">
          <h4 className="text-2xl text-slate-400 font-bold mb-1 uppercase">현재습도</h4>
          <p className="text-xl font-bold text-slate-700">{weather.humidity}%</p>
        </section>
      </footer>

    </article>
  );
};