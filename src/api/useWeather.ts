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

export const useWeather = (searchLocation?: { nx: number; ny: number }) => {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 공통 날씨 데이터 가공 함수
    const getWeatherData = async (nx: number, ny: number) => {
      setLoading(true);
      try {
        const matched = regions.find(r => r.nx === nx && r.ny === ny && r.dong !== "") 
                        || regions.find(r => r.nx === nx && r.ny === ny);
        
        const locationData = matched ? {
          city: matched.city,
          gu: matched.gu,
          dong: matched.dong,
          full: `${matched.city} ${matched.gu} ${matched.dong}`.trim()
        } : { city: "알 수 없는 지역", gu: "", dong: "", full: "알 수 없는 지역" };

        const { items, displayTime } = await fetchWeather(nx, ny);

        const currentTemp = items.find((i: WeatherItem) => i.category === "TMP")?.fcstValue ?? "0";

        const minTemp = items.find((i: WeatherItem) => i.category === "TMN")?.fcstValue ?? 
                        items.filter((i: WeatherItem) => i.category === "TMP")
                            // ✅ (a: WeatherItem, b: WeatherItem) 처럼 타입을 명시합니다.
                            .sort((a: WeatherItem, b: WeatherItem) => Number(a.fcstValue) - Number(b.fcstValue))[0]?.fcstValue;

        const maxTemp = items.find((i: WeatherItem) => i.category === "TMX")?.fcstValue || "-";

        const hourlyForecast = items
          .filter((i: WeatherItem) => i.category === "TMP")
          .slice(0, 12)
          .map((i: WeatherItem) => {
            const hourSky = items.find((item: WeatherItem) => item.fcstTime === i.fcstTime && item.fcstDate === i.fcstDate && item.category === "SKY")?.fcstValue || "1";
            const hourPty = items.find((item: WeatherItem) => item.fcstTime === i.fcstTime && item.fcstDate === i.fcstDate && item.category === "PTY")?.fcstValue || "0";
            const status = getWeatherStatus(hourSky, hourPty);
            return {
              time: i.fcstTime.slice(0, 2) + "시",
              temp: i.fcstValue,
              icon: status.icon,
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
          hourly: hourlyForecast,
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
    };

    // ✅ 인자값 유무에 따른 분기 처리
    if (searchLocation) {
      // 1. 외부에서 좌표가 들어오면 (즐겨찾기 카드 등) 해당 좌표 사용
      getWeatherData(searchLocation.nx, searchLocation.ny);
    } else {
      // 2. 인자가 없으면 기존처럼 GPS 위치 사용
      if (!navigator.geolocation) {
        setLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { nx, ny } = convertToNxNy(pos.coords.latitude, pos.coords.longitude);
          getWeatherData(nx, ny);
        },
        () => setLoading(false)
      );
    }
  }, [searchLocation?.nx, searchLocation?.ny]); // ✅ 좌표가 바뀌면 다시 호출

  return { weather, loading };
};