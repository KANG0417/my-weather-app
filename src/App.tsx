import React, { useState } from "react";
import { TabNavigation } from "./shared/ui/nav/TabNavigation";
import { WeatherContent } from "./shared/ui/contents/WeatherContent";


// 탭 타입 정의
type TabType = "search" | "current" | "favorites";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("current");

  return (
    /* 전체 배경 및 가운데 정렬 컨테이너 */
    <div className="flex flex-col min-h-screen items-center bg-slate-50 font-sans p-6">
      <header className="text-center mt-10 mb-10">
        <h1 className="text-[3rem] md:text-[5rem] lg:text-[7rem] font-black text-blue-600 mb-2 font-title">날씨요정</h1>
        <p className="text-[1.5rem] lg:text-[1.5rem] text-slate-600 font-medium font-title">
          어느 지역의 날씨를 알아볼까요?
        </p>
      </header>

      {/* 네비게이션 위젯 */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* 메인 콘텐츠 위젯 */}
      <WeatherContent activeTab={activeTab} />
    </div>
  );
};

export default App;