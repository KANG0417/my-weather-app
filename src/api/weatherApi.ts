// src/shared/api/weather.ts
export interface WeatherItem {
  baseDate: string;  
  baseTime: string;  
  category: string;  
  fcstDate: string;  // 예보일자 (단기예보에 필수)
  fcstTime: string;  // 예보시각 (단기예보에 필수)
  fcstValue: string; 
  nx: number;
  ny: number;
}

export const fetchWeather = async (nx: number, ny: number) => {
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const now = new Date();

  const getBaseTime = () => {
    const hours = now.getHours();
    // 02:10분 이전이면 전날 23:00 데이터를 가져와야 안전
    if (hours < 2 || (hours === 2 && now.getMinutes() < 10)) {
      return { baseDateOffset: -1, baseTime: "2300" };
    }
    
    // 발표 시간 리스트: 02, 05, 08, 11, 14, 17, 20, 23
    const times = [2, 5, 8, 11, 14, 17, 20, 23];
    const baseHour = times.filter(t => t <= hours).pop();
    return { 
      baseDateOffset: 0, 
      baseTime: baseHour?.toString().padStart(2, '0') + "00" 
    };
  };

  const { baseDateOffset, baseTime } = getBaseTime();
  
  // 날짜 계산 (전날로 넘어가는 경우 포함)
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + baseDateOffset);
  
  const baseDate = targetDate.getFullYear() + 
                   (targetDate.getMonth() + 1).toString().padStart(2, '0') + 
                   targetDate.getDate().toString().padStart(2, '0');

  // API 호출 (getVilageFcst 사용)
  // 오늘 하루치와 다음날 일부를 가져오기 위해 numOfRows를 500으로 늘림
  const url = `/api/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${API_KEY}&pageNo=1&numOfRows=500&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("네트워크 응답에 문제가 있습니다.");
  
  const data = await response.json();
  
  if (data.response?.header?.resultCode !== "00") {
    throw new Error(data.response?.header?.resultMsg || "API 에러");
  }

  // 3. 화면 표시용 시간은 실제 현재 시각으로 전달
  const displayTime = `${now.getHours()}시 ${now.getMinutes()}분`;

  return {
    items: data.response.body.items.item,
    displayTime: displayTime 
  };
};