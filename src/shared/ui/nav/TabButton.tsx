import { motion } from "framer-motion";

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

export const TabButton = ({ label, icon, isActive, onClick }: TabButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 flex flex-col items-center justify-center py-2 md:py-4 lg:py-5 z-10 transition-colors duration-300 font-nav ${
        isActive ? "text-blue-600" : "text-white/70"
      }`}
    >
      {/* 아이콘 영역 */}
      <span className="text-xl w-6 h-6 flex items-center justify-center mb-1">
        {icon}
      </span>

      {/* 라벨 영역 */}
      <span className={`text-[0.9rem] lg:text-[1rem] font-bold transition-all ${isActive ? "scale-110" : "scale-100"}`}>
        {label}
      </span>

      {/* 활성화 시 부드럽게 움직이는 배경 (Framer Motion) */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-white rounded-full -z-10 shadow-md"
          transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
        />
      )}
    </button>
  );
};