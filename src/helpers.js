import {get_weather_infos, get_geocoding} from '@/actions/weather' 


export const fetch_weather = (region) => {
    /**** BEGIN Get geo coding of given city ****/
    return get_geocoding(region).then(
        (res) => {  
          /**** BEGIN Get weather info ****/
            get_weather_infos(res?.lat,res?.lon).then(
              (res_infos) => {  
                return res_infos
              }
            ).catch(
              (error) => {
                console.error(error);
                return []
              }
            )
          /**** END Get weather info ****/

        }
      ).catch(
        (error) => {
            console.error(error);
            return []
        }
      )
    /**** END Get geo coding of given city ****/
  }