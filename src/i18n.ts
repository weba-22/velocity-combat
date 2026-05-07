import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      game_title: "BLUR: OVERDRIVE",
      start_game: "Start Race",
      settings: "Settings",
      garage: "Garage",
      health: "Armor",
      speed: "Speed",
      lap: "Lap",
      score: "Score",
      game_over: "Wasted",
      victory: "First Place",
      retry: "Retry",
      quit: "Quit",
      weapon_missile: "Bolt",
      weapon_nitro: "Nitro",
      weapon_shield: "Shield",
      weapon_mine: "Mine",
      weather_clear: "Clear",
      weather_rain: "Rain",
      weather_storm: "Storm",
    }
  },
  rw: {
    translation: {
      game_title: "BLUR: UMUVUDUKO",
      start_game: "Tangira Isiganwa",
      settings: "Igenamiterere",
      garage: "Ihuriro",
      health: "Ubuzima",
      speed: "Umuvuduko",
      lap: "Inshuro",
      score: "Amanota",
      game_over: "Uratsinzwe",
      victory: "Uwa Mbere",
      retry: "Ongera",
      quit: "Sohoka",
      weapon_missile: "Isasu",
      weapon_nitro: "Iyongerambaga",
      weapon_shield: "Ingabo",
      weapon_mine: "Tegera",
      weather_clear: "Gukambura",
      weather_rain: "Imvura",
      weather_storm: "Inkuba",
    }
  },
  sw: {
    translation: {
      game_title: "BLUR: KASI",
      start_game: "Anza Mashindano",
      settings: "Mipangilio",
      garage: "Karakana",
      health: "Afya",
      speed: "Kasi",
      lap: "Mzunguko",
      score: "Alama",
      game_over: "Umeshindwa",
      victory: "Mshindi",
      retry: "Jaribu Tena",
      quit: "Ondoka",
      weapon_missile: "Kombora",
      weapon_nitro: "Ongezeko",
      weapon_shield: "Nao",
      weapon_mine: "Mtego",
      weather_clear: "Anga Safi",
      weather_rain: "Mvua",
      weather_storm: "Dhoruba",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
