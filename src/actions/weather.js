import axios from "axios";
import { API_conf } from "@/API_conf";

export const get_weather_infos = async (lat, lon) => {

    const api_result = await axios.get(
        API_conf.API,
            {
                params:{
                    lat,
                    lon,
                    appid: API_conf.KEY,
                }
            }
        )

    return api_result?.data
}