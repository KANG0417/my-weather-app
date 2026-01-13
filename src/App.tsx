import React, { useState } from "react";
import { TabNavigation } from "./shared/ui/nav/TabNavigation";
import { WeatherContent } from "./shared/ui/contents/WeatherContent";
import { WeatherHeader } from "./shared/ui/header/WeatherHeader";
import { WeatherFooter } from "./shared/ui/footer/WeatherFooter";


// 탭 타입 정의
type TabType = "search" | "current" | "favorites";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("current");

  return (
    <div className="flex flex-col min-h-screen items-center bg-slate-50 font-sans p-6">
      {/* 최상단 */}
      <WeatherHeader />
      {/* 네비게이션*/}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {/* 메인 콘텐츠 */}
      <WeatherContent activeTab={activeTab} />
      {/* 하단 */}
      <WeatherFooter />
    </div>
  );
};

export default App;