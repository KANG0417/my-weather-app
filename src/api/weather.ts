// .env에 저장한 키 가져오기
const SERVICE_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export const getWeatherData = async (nx: number, ny: number) => {
  const now = new Date();
  const baseDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD 형식
  const baseTime = "0600"; // 기상청 발표 시간 (예시: 오전 6시)

  // vite.config.ts에서 설정한 /api 프록시 사용
  const url = `/api/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${SERVICE_KEY}&numOfRows=10&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${nx}&ny=${ny}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.response.header.resultCode !== "00") {
      console.error("API 에러:", data.response.header.resultMsg);
      return null;
    }

    return data.response.body.items.item;
  } catch (error) {
    console.error("네트워크 에러:", error);
    return null;
  }
};
