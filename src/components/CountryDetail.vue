<template>
  <div class="q-mx-auto" style="max-width: 800px">
    <q-btn
      flat
      no-caps
      color="grey-8"
      icon="chevron_left"
      label="Volver al listado"
      class="q-mb-md"
      @click="$emit('back')"
    />

    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
    </div>

    <q-banner v-else-if="error" class="bg-negative text-white rounded-borders">
      {{ error }}
    </q-banner>

    <q-card v-else-if="country" flat bordered class="q-pa-lg rounded-borders">
      <!-- Cabecera: bandera, nombre y continente -->
      <div class="row items-center q-gutter-md q-mb-lg">
        <q-img
          v-if="flagUrl"
          :src="flagUrl"
          width="110px"
          height="72px"
          class="rounded-borders shadow-2"
          fit="cover"
        />
        <div>
          <div class="text-h5 text-weight-bold">{{ countryName }}</div>
          <q-chip dense color="blue-1" text-color="blue-9" class="q-mt-xs q-ml-none">
            {{ continent }}
          </q-chip>
        </div>
      </div>

      <!-- Capital destacada -->
      <div class="bg-primary text-white q-pa-md rounded-borders q-mb-lg row items-center q-gutter-sm">
        <q-icon name="place" size="sm" />
        <div>
          <div class="text-caption text-blue-2">CAPITAL</div>
          <div class="text-h6 text-weight-bold">{{ capital }}</div>
        </div>
      </div>

      <!-- Grilla de datos -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-4">
          <div class="bg-grey-1 q-pa-md rounded-borders">
            <div class="text-caption text-grey-7">Población</div>
            <div class="text-subtitle1 text-weight-bold">{{ formattedPopulation }}</div>
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div class="bg-grey-1 q-pa-md rounded-borders">
            <div class="text-caption text-grey-7">Área</div>
            <div class="text-subtitle1 text-weight-bold">{{ formattedArea }}</div>
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div
            class="bg-grey-1 q-pa-md rounded-borders"
            :class="{ 'cursor-pointer': primaryCurrency }"
            @click="primaryCurrency && $emit('select-currency', primaryCurrency)"
          >
            <div class="text-caption text-grey-7">Moneda</div>
            <div class="text-subtitle1 text-weight-bold text-primary">
              {{ currencyText }}
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div class="bg-grey-1 q-pa-md rounded-borders">
            <div class="text-caption text-grey-7">Idiomas</div>
            <div class="text-subtitle1 text-weight-bold">{{ languages }}</div>
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div class="bg-grey-1 q-pa-md rounded-borders">
            <div class="text-caption text-grey-7">Zona horaria</div>
            <div class="text-subtitle1 text-weight-bold">{{ timezone }}</div>
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div class="bg-grey-1 q-pa-md rounded-borders">
            <div class="text-caption text-grey-7">Código telefónico</div>
            <div class="text-subtitle1 text-weight-bold">{{ callingCode }}</div>
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div class="bg-grey-1 q-pa-md rounded-borders">
            <div class="text-caption text-grey-7">Dominio</div>
            <div class="text-subtitle1 text-weight-bold">{{ domain }}</div>
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div class="bg-grey-1 q-pa-md rounded-borders">
            <div class="text-caption text-grey-7">Conducción</div>
            <div class="text-subtitle1 text-weight-bold">{{ drivingSide }}</div>
          </div>
        </div>
      </div>

      <!-- Países fronterizos -->
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Países fronterizos</div>
        <div v-if="borders.length" class="row q-gutter-xs">
          <q-chip v-for="border in borders" :key="border" dense color="grey-2" text-color="grey-9">
            {{ border }}
          </q-chip>
        </div>
        <div v-else class="text-body2 text-grey-6">Sin fronteras terrestres</div>
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getFlagUrl } from '../services/api'

const props = defineProps({
  country: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null }
})

defineEmits(['back', 'select-currency'])

const flagUrl = computed(() => getFlagUrl(props.country?.codes?.alpha_2, 'w320'))
const countryName = computed(
  () => props.country?.names?.translations?.spa?.common || props.country?.names?.common || ''
)
const continent = computed(() => props.country?.continents?.[0] || props.country?.region || 'N/A')
const capital = computed(() => props.country?.capitals?.[0]?.name || 'Sin capital')

const formattedPopulation = computed(() => {
  const pop = props.country?.population
  return pop ? pop.toLocaleString('es-PE') : 'N/A'
})

const formattedArea = computed(() => {
  const km = props.country?.area?.kilometers
  return km ? `${km.toLocaleString('es-PE')} km²` : 'N/A'
})

const primaryCurrency = computed(() => props.country?.currencies?.[0] || null)
const currencyText = computed(() => {
  if (!primaryCurrency.value) return 'N/A'
  return `${primaryCurrency.value.name} (${primaryCurrency.value.code})`
})

const languages = computed(() => {
  const langs = props.country?.languages || []
  return langs.length ? langs.map((l) => l.name).join(', ') : 'N/A'
})

const timezone = computed(() => props.country?.timezones?.[0] || 'N/A')
const callingCode = computed(() => {
  const code = props.country?.calling_codes?.[0]
  return code ? `+${code}` : 'N/A'
})
const domain = computed(() => props.country?.tlds?.[0] || 'N/A')

const drivingSide = computed(() => {
  const side = props.country?.cars?.driving_side
  if (side === 'right') return 'Derecha'
  if (side === 'left') return 'Izquierda'
  return 'N/A'
})

const borders = computed(() => props.country?.borders || [])
</script>