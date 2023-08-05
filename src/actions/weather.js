import axios from "axios";
import { API_config } from "@/config";

export const get_weather_infos = async (lat, lon) => {
    const api_result = await axios.get(
        API_config.API,
            {
                params:{
                    lat,
                    lon,
                    units: 'kelvin',
                    appid: API_config.KEY,
                }
            }
        )
    return api_result?.data
}

export const get_geocoding = async (q) => {
    const api_result = await axios.get(
        API_config.API_GEOCODING,
            {
                params:{
                    q,
                    appid: API_config.KEY,
                }
            }
        )
    return api_result?.data[0]
}