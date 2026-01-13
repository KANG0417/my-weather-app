import { motion, AnimatePresence } from "framer-motion";
import { FavoritesTab } from "./FavoritesTab";
import { CurrentTab } from "./CurrentTab";
import { SearchTab } from "./SearchTab";

interface WeatherContentProps {
  activeTab: string;
}

const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 }
};

export const WeatherContent = ({ activeTab }: WeatherContentProps) => {
  // 1. 장소가 선택되었을 때 실행할 함수 정의
  const handleLocationSelect = (location: string) => {
    console.log("선택된 장소:", location);
    // 여기서 검색된 장소의 날씨 데이터를 가져오거나, 탭을 이동시키는 로직을 작성합니다.
  };
  
  return (
    <main className="w-full max-w-s md:max-w-[70rem] lg:max-w-[80rem] mx-auto transition-all duration-300 font-sans">
      <section className="bg-white rounded-[2.5rem] shadow-xl p-8 min-h-[500px] flex flex-colitems-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            {...tabVariants}
            className="w-full text-center"
          >
            {activeTab === "current" && <CurrentTab />}
            {activeTab === "search" && <SearchTab onSelectLocation={handleLocationSelect} />}
            {activeTab === "favorites" && <FavoritesTab />}
          </motion.div>
        </AnimatePresence>
     </section>
    </main>
  );
};