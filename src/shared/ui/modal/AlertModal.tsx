export const AlertModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-xs w-full shadow-2xl transform animate-in zoom-in-95 duration-200 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-black text-slate-800 mb-2">즐겨찾기 한도 초과</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          최대 6개까지만 등록할 수 있습니다.<br/>다른 지역을 삭제 후 이용해 주세요.
        </p>
        <button 
          onClick={onClose}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all"
        >
          확인
        </button>
      </div>
    </div>
  );
};