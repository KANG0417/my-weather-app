import { useState, useEffect } from "react";
import { fetchWeather, type WeatherItem } from "./weatherApi";
import { convertToNxNy } from "@/utils/convertToNxNy";
import { getWeatherStatus } from "@/shared/lib/getWeatherStatus";
// 1. JSON 데이터 임포트
import regions from "@/shared/data/regions.json"; 

interface WeatherInfo {
  temp: string;
  humidity: string;
  label: string;
  icon: string;
  baseTime: string;
  displayTime?: string;
  location: { // 지역 정보
    city: string;
    gu: string;
    dong: string;
    full: string;
  };
  minTemp: string; // 최저 기온
  maxTemp: string; // 최고 기온
  hourly: { 
    time: string; 
    temp: string; 
    icon: string;
    label: string;
  }[];
}

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("이 브라우저는 위치 정보를 지원하지 않습니다.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos: GeolocationPosition) => {
        try {
          const { latitude, longitude } = pos.coords;

          // 3. 위경도를 격자 좌표(nx, ny)로 변환
          const { nx, ny } = convertToNxNy(latitude, longitude);
          
          // 4. JSON에서 지역 이름 매칭 로직
          // 중복되는 좌표가 많으므로 '동' 정보가 있는 것을 우선적으로 찾습니다.
          const matched = regions.find(r => r.nx === nx && r.ny === ny && r.dong !== "") 
                        || regions.find(r => r.nx === nx && r.ny === ny);
          const locationData = matched
            ? {
                city: matched.city,
                gu: matched.gu,
                dong: matched.dong,
                full: `${matched.city} ${matched.gu} ${matched.dong}`.trim()
              }
            : {
                city: "알 수 없는 지역",
                gu: "",
                dong: "",
                full: "알 수 없는 지역"
              };

          // 5. 날씨 데이터 요청
         const { items, displayTime } = await fetchWeather(nx, ny);

          // 1. 현재 기온 (TMP)
          const currentTemp = items.find((i: WeatherItem) => i.category === "TMP")?.fcstValue || "0";

          // 2. 당일 최저/최고 기온 추출 (TMN, TMX)
          // 기상청 API에서 TMN(최저)은 아침 6시, TMX(최고)는 오후 3시경 데이터에 포함됩니다.
          const minTemp = items.find((i: WeatherItem) => i.category === "TMN")?.fcstValue || "-";
          const maxTemp = items.find((i: WeatherItem) => i.category === "TMX")?.fcstValue || "-";

          // 3. 시간대별 기온 (오늘 분량만 추출)
          const hourlyForecast = items
              .filter((i: WeatherItem) => i.category === "TMP")
              .slice(0, 12) // 향후 12시간 정도 보여주기
              .map((i: WeatherItem) => {
                // 해당 시간(fcstTime)과 날짜(fcstDate)가 일치하는 SKY, PTY 찾기
                const hourSky = items.find(
                  (item: WeatherItem) => 
                    item.fcstTime === i.fcstTime && 
                    item.fcstDate === i.fcstDate && 
                    item.category === "SKY"
                )?.fcstValue || "1";

                const hourPty = items.find(
                  (item: WeatherItem) => 
                    item.fcstTime === i.fcstTime && 
                    item.fcstDate === i.fcstDate && 
                    item.category === "PTY"
                )?.fcstValue || "0";

                // 시간대별 날씨 상태 계산
                const status = getWeatherStatus(hourSky, hourPty);

                return {
                  time: i.fcstTime.slice(0, 2) + "시",
                  temp: i.fcstValue,
                  icon: status.icon, // ✨ 시간대별 아이콘 추가
                  label: status.label
                };
              });

          const status = getWeatherStatus(
            items.find((i: WeatherItem) => i.category === "SKY")?.fcstValue || "1",
            items.find((i: WeatherItem) => i.category === "PTY")?.fcstValue || "0"
          );

          setWeather({
            temp: currentTemp,
            minTemp,
            maxTemp,
            hourly: hourlyForecast, // 시간대별 데이터 추가
            humidity: items.find((i: WeatherItem) => i.category === "REH")?.fcstValue || "0",
            label: status.label,
            icon: status.icon,
            baseTime: displayTime,
            location: locationData
          });
          } catch (err) {
            console.error("날씨 정보 호출 실패:", err);
          } finally {
            setLoading(false);
          }
      },
      (error) => {
        console.error("위치 정보를 가져올 수 없습니다:", error);
        setLoading(false);
      }
    );
  }, []);

  return { weather, loading };
};