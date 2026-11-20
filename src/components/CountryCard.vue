<template>
  <q-card
    class="country-card cursor-pointer full-height column justify-between"
    flat
    bordered
    @click="$emit('select-country', country)"
  >
    <q-card-section>
      <div class="row items-center no-wrap q-gutter-sm q-mb-sm">
        <q-img
          v-if="flagUrl"
          :src="flagUrl"
          width="36px"
          height="24px"
          class="rounded-borders shadow-1"
          fit="cover"
        />
        <div v-else class="bg-grey-3 text-grey-7 text-caption q-px-xs rounded-borders">
          {{ alpha2 || 'N/A' }}
        </div>
        <div class="text-subtitle1 text-weight-bold ellipsis">
          {{ countryName }}
        </div>
      </div>

      <div class="row justify-between items-center text-caption text-grey-7 q-mb-md">
        <div class="ellipsis">Capital: {{ capital }}</div>
        <div class="text-weight-medium">{{ formattedPopulation }}</div>
      </div>

      <div class="row items-center q-gutter-xs">
        <q-chip
          dense
          size="sm"
          color="blue-1"
          text-color="blue-9"
          class="q-ma-none"
        >
          {{ continent }}
        </q-chip>

        <q-chip
          v-if="primaryCurrency"
          dense
          clickable
          size="sm"
          color="green-1"
          text-color="green-9"
          icon="attach_money"
          class="q-ma-none"
          @click.stop="$emit('select-currency', primaryCurrency)"
        >
          {{ primaryCurrency.code }}
        </q-chip>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { getFlagUrl } from '../services/api'

const props = defineProps({
  country: {
    type: Object,
    required: true
  }
})

defineEmits(['select-country', 'select-currency'])

const alpha2 = computed(() => props.country.codes?.alpha_2 || '')
const flagUrl = computed(() => getFlagUrl(alpha2.value, 'w160'))
const countryName = computed(
  () => props.country.names?.translations?.spa?.common || props.country.names?.common || 'Sin nombre'
)
const capital = computed(() => props.country.capitals?.[0]?.name || 'Sin capital')
const continent = computed(() => props.country.continents?.[0] || props.country.region || 'N/A')
const primaryCurrency = computed(() => props.country.currencies?.[0] || null)

const formattedPopulation = computed(() => {
  const pop = props.country.population
  if (!pop) return '0'
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)} M`
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(1)} K`
  return pop.toString()
})
</script>

<style scoped>
.country-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border-radius: 10px;
}
.country-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>