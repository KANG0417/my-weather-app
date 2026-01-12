// src/widgets/tab-navigation/ui/TabNavigation.tsx
import LocationPng from "@/assets/icons/LocationIcon.png";
import SearchPng from "@/assets/icons/SearchIcon.png";
import FavoritePng from "@/assets/icons/FavoriteIcon.png";
import { TabButton } from "./TabButton";

// 탭 타입 정의
export type TabType = "search" | "current" | "favorites";

interface TabNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const TabNavigation = ({ activeTab, setActiveTab }: TabNavigationProps) => {
  return (
    <nav className="relative flex items-center justify-between w-full lg:max-w-[70rem] bg-blue-600 p-2 px-4 rounded-full shadow-lg mb-8">
      <TabButton
        label="내 위치" 
        icon={<img src={LocationPng} alt="위치" className="w-5 h-5 object-contain" />}
        isActive={activeTab === "current"} 
        onClick={() => setActiveTab("current")} 
      />
      <TabButton 
        label="검색" 
        icon={<img src={SearchPng} alt="검색" className="w-5 h-5 object-contain" />} 
        isActive={activeTab === "search"} 
        onClick={() => setActiveTab("search")} 
      />
      <TabButton 
        label="즐겨찾기" 
        icon={<img src={FavoritePng} alt="즐겨찾기" className="w-5 h-5 object-contain" />}
        isActive={activeTab === "favorites"} 
        onClick={() => setActiveTab("favorites")} 
      />
    </nav>
  );
};