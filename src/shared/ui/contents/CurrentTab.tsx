import { useWeather } from "@/api/useWeather";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export const CurrentTab = () => {
  const { weather, loading } = useWeather();

  if (loading || !weather) return <LoadingSpinner />;

  return (
    // <article>은 하나의 완성된 독립적인 콘텐츠(날씨 정보)를 의미합니다.
    <article className="flex flex-col items-center w-full pt-8 pb-8 pl-6 pr-6">
      
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
          <div className="text-[4rem] lg:text-[8rem] font-black leading-none text-slate-900 flex items-start">
            {weather.temp}<span className="text-[3rem] lg:text-[4rem] lg:mt-6 lg:ml-1 text-blue-500" aria-label="도">°</span>
          </div>
          <figcaption className="sr-only">{weather.label} 상태이며 온도는 {weather.temp}도입니다.</figcaption>
        </figure>

        <div className="flex gap-4 text-lg font-bold mt-2">
          <span className="text-blue-500">↓ 최저 {weather.minTemp}°</span>
          <span className="text-red-500">↑ 최고 {weather.maxTemp}°</span>
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