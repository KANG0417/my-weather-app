interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BaseModal = ({ isOpen, onClose, children }: BaseModalProps) => {
  if (!isOpen) return null;

  return (
    // 1. 배경 (검은색 반투명 + 클릭 시 닫힘)
    <div 
      className="cursor-default select-none fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 2. 모달 바디 (하얀 박스 + 내부 클릭 시 닫힘 방지) */}
      <div 
        className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in-95 duration-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()} // 박스 내부 클릭 시 모달이 닫히지 않게 함
      >
        {children}
      </div>
    </div>
  );
};