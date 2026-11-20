<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="q-mx-auto" style="max-width: 1200px">
      <!-- Vista 2: Detalle del país -->
      <CountryDetail
        v-if="selectedCountry || loadingDetail"
        :country="selectedCountry"
        :loading="loadingDetail"
        :error="detailError"
        @back="selectedCountry = null"
        @select-currency="openCurrencyModal"
      />

      <!-- Vista 1: Listado de países -->
      <div v-else>
        <div class="text-h5 text-weight-bold q-mb-xs">Explorador de países</div>
        <div class="text-body2 text-grey-7 q-mb-lg">
          Busca por capital, filtra por continente, toca una tarjeta para ver el detalle o toca la moneda para ver su tasa
        </div>

        <!-- Filtros -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-md-9">
            <div class="text-caption text-weight-medium q-mb-xs">Buscar</div>
            <q-input
              v-model="searchCapital"
              outlined
              dense
              clearable
              bg-color="white"
              placeholder="Buscar por capital..."
              debounce="500"
              @update:model-value="handleSearchCapital"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <div class="text-caption text-weight-medium q-mb-xs">Continente</div>
            <q-select
              v-model="selectedRegion"
              :options="regions"
              outlined
              dense
              bg-color="white"
              emit-value
              map-options
              @update:model-value="handleRegionChange"
            />
          </div>
        </div>

        <!-- Estados de carga y error -->
        <div v-if="loading" class="flex flex-center q-pa-xl">
          <q-spinner color="primary" size="3em" />
        </div>

        <q-banner v-else-if="error" class="bg-negative text-white rounded-borders q-mb-md">
          {{ error }}
        </q-banner>

        <div v-else-if="!countries.length" class="text-center text-grey-7 q-pa-xl">
          No se encontraron países con ese criterio.
        </div>

        <!-- Grilla de tarjetas -->
        <div v-else class="row q-col-gutter-md">
          <div
            v-for="country in countries"
            :key="country.uuid || country.codes?.alpha_2 || country.names?.common"
            class="col-12 col-sm-6 col-md-3"
          >
            <CountryCard
              :country="country"
              @select-country="openCountryDetail"
              @select-currency="openCurrencyModal"
            />
          </div>
        </div>
      </div>

      <!-- Modal de moneda -->
      <CurrencyModal
        v-model="currencyModalOpen"
        :currency="selectedCurrency"
      />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import CountryCard from '../components/CountryCard.vue'
import CountryDetail from '../components/CountryDetail.vue'
import CurrencyModal from '../components/CurrencyModal.vue'

const countries = ref([])
const loading = ref(false)
const error = ref(null)

const searchCapital = ref('')
const selectedRegion = ref('all')

const regions = [
  { label: 'Todos los continentes', value: 'all' },
  { label: 'África', value: 'Africa' },
  { label: 'América', value: 'Americas' },
  { label: 'Asia', value: 'Asia' },
  { label: 'Europa', value: 'Europe' },
  { label: 'Oceanía', value: 'Oceania' }
]

const selectedCountry = ref(null)
const loadingDetail = ref(false)
const detailError = ref(null)

const currencyModalOpen = ref(false)
const selectedCurrency = ref(null)

const extractObjects = (res) => {
  return res.data?.data?.objects || (Array.isArray(res.data?.data) ? res.data.data : [])
}

const loadAllCountries = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await api.getAllCountries()
    countries.value = extractObjects(res)
  } catch (err) {
    error.value = 'Error al cargar los países.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleSearchCapital = async (val) => {
  if (!val || !val.trim()) {
    selectedRegion.value = 'all'
    await loadAllCountries()
    return
  }

  loading.value = true
  error.value = null
  try {
    const res = await api.searchByCapital(val.trim())
    countries.value = extractObjects(res)
  } catch (err) {
    countries.value = []
    if (err.response?.status !== 404) {
      error.value = 'Error al buscar por capital.'
    }
  } finally {
    loading.value = false
  }
}

const handleRegionChange = async (region) => {
  searchCapital.value = ''
  if (region === 'all') {
    await loadAllCountries()
    return
  }

  loading.value = true
  error.value = null
  try {
    const res = await api.getByRegion(region)
    countries.value = extractObjects(res)
  } catch (err) {
    error.value = 'Error al filtrar por continente.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openCountryDetail = async (country) => {
  const code = country.codes?.alpha_2
  if (!code) {
    selectedCountry.value = country
    return
  }

  loadingDetail.value = true
  detailError.value = null
  selectedCountry.value = null
  try {
    const res = await api.getCountryByCode(code)
    const objs = extractObjects(res)
    selectedCountry.value = objs[0] || res.data?.data || country
  } catch (err) {
    detailError.value = 'No se pudo cargar el detalle del país.'
    console.error(err)
  } finally {
    loadingDetail.value = false
  }
}

const openCurrencyModal = (currency) => {
  selectedCurrency.value = currency
  currencyModalOpen.value = true
}

onMounted(loadAllCountries)
</script>