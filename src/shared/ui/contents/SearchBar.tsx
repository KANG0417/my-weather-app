import { useState, useEffect, type ChangeEvent } from "react";

// 부모에게서 받을 데이터들의 타입을 정의합니다.
interface SearchBarProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  // 추가로 엔터키 검색 기능을 위해 아래 속성을 넣으면 좋습니다 (선택사항)
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SearchBar = ({ value, onChange, onKeyDown }: SearchBarProps) => {
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setPlaceholder("동네 이름 입력");
      } else {
        setPlaceholder("동네 이름을 입력하세요 (예: 서울특별시, 가락동)");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <input 
      type="text" 
      // ✅ 부모로부터 받은 value와 onChange를 직접 연결합니다.
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="w-full bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-400 text-sm sm:text-base" 
    />
  );
};