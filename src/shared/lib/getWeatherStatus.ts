/**
 * 기상청 SKY/PTY 코드를 한글 명칭과 아이콘으로 변환
 * @param sky 하늘상태 (1:맑음, 3:구름많음, 4:흐림)
 * @param pty 강수형태 (0:없음, 1:비, 2:비/눈, 3:눈, 4:소나기)
 */

export const getWeatherStatus = (sky: string, pty: string) => {
  // 1. 강수 형태가 있는 경우 (비/눈 우선)
  if (pty !== "0") {
    const ptyMap: Record<string, { label: string; icon: string }> = {
      "1": { label: "비", icon: "🌧️" },
      "2": { label: "비/눈", icon: "🌨️" },
      "3": { label: "눈", icon: "❄️" },
      "4": { label: "소나기", icon: "🌦️" },
    };
    return ptyMap[pty] || { label: "강수", icon: "☔" };
  }

  // 2. 강수 형태가 없는 경우 하늘 상태 기준
  const skyMap: Record<string, { label: string; icon: string }> = {
    "1": { label: "맑음", icon: "☀️" },
    "3": { label: "구름많음", icon: "⛅" },
    "4": { label: "흐림", icon: "☁️" },
  };

  return skyMap[sky] || { label: "맑음", icon: "☀️" };
};