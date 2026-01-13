export const WeatherFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-10 px-6 border-t border-slate-100 w-full bg-slate-50/50">
      <div className="max-w-2xl mx-auto flex flex-col items-center space-y-4">
        
        {/* 만든이 정보 */}
        <div className="flex items-center gap-2 text-slate-600 font-bold">
          <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
          <span>Made by. 강지향</span>
          <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
        </div>

        {/* 상세 저작권 및 출처 정보 */}
        <div className="flex flex-col items-center space-y-1 text-xs text-slate-400 leading-relaxed text-center">
          <p>© {currentYear} Weather Fairy. All rights reserved.</p>
          
          <nav className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
            <span className="after:content-['|'] after:ml-3 last:after:content-none">
              Weather Data by <a href="#" className="hover:text-blue-500 transition-colors">OpenWeatherMap</a>
            </span>
            <span className="after:content-['|'] after:ml-3 last:after:content-none">
              Icons by <a href="https://www.flaticon.com/" title="icons" className="hover:text-blue-500 transition-colors">Flaticon</a>
            </span>
            <span>
              Address Data by <a href="#" className="hover:text-blue-500 transition-colors">Public Data Portal</a>
            </span>
          </nav>
        </div>

        {/* 안내 문구 */}
        <p className="text-[10px] text-slate-300">
          본 사이트는 개인 포트폴리오 용도로 제작되었으며, 상업적 목적으로 이용되지 않습니다.
        </p>
      </div>
    </footer>
  );
};