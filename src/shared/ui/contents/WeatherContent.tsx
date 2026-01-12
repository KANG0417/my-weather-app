import { motion, AnimatePresence } from "framer-motion";
import { SearchTab } from "./SearchTab";
import { FavoritesTab } from "./FavoritesTab";
import { CurrentTab } from "./CurrentTab";

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
  return (
    <main className="w-full max-w-s md:max-w-[70rem] lg:max-w-[80rem] mx-auto transition-all duration-300 font-sans">
      <section className="bg-white rounded-[2.5rem] shadow-xl p-8 min-h-[500px] flex flex-colitems-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            {...tabVariants}
            className="w-full text-center"
          >
            {activeTab === "search" && <SearchTab />}
            {activeTab === "current" && <CurrentTab />}
            {activeTab === "favorites" && <FavoritesTab />}
          </motion.div>
        </AnimatePresence>
     </section>
    </main>
  );
};