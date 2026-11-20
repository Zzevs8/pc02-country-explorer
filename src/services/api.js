import axios from 'axios'

// Pega aquí tu API Key de restcountries.com
const API_KEY = 'rc_live_17b83dd6479c434c9e552a5894a02768'

const headers = {
  Authorization: `Bearer ${API_KEY}`
}

const countriesClient = axios.create({
  baseURL: '/api-rc/countries/v5',
  headers
})

const currenciesClient = axios.create({
  baseURL: '/api-rc/currencies/v1',
  headers
})

export const api = {
  // Listado inicial
  getAllCountries: () => countriesClient.get(''),

  // Búsqueda por capital
  searchByCapital: (texto) => countriesClient.get(`/capitals?q=${encodeURIComponent(texto)}`),

  // Filtro por continente
  getByRegion: (continente) => countriesClient.get(`/region/${encodeURIComponent(continente)}`),

  // Detalle de un país por código ISO alpha-2
  getCountryByCode: (codigo) => countriesClient.get(`/codes.alpha_2/${codigo}`),

  // Tasa de cambio
  getCurrencyRate: (codigoMoneda) => currenciesClient.get(`/rates/${codigoMoneda}`),

  // Conversión de montos
  convertCurrency: (origen, destino, monto) =>
    currenciesClient.get(`/convert?from=${origen}&to=${destino}&amount=${monto}`)
}

// Banderas desde flagcdn.com (código ISO alpha-2 en minúsculas)
export const getFlagUrl = (code, size = 'w160') => {
  if (!code) return ''
  return `https://flagcdn.com/${size}/${code.toLowerCase()}.png`
}