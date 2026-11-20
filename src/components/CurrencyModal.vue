<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 340px; max-width: 420px; border-radius: 12px" class="q-pa-sm">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="row items-center q-gutter-sm">
          <div
            class="bg-green-1 text-green-9 text-weight-bold flex flex-center rounded-borders"
            style="width: 40px; height: 40px"
          >
            {{ currency?.symbol || '$' }}
          </div>
          <div>
            <div class="text-subtitle1 text-weight-bold">{{ currency?.name }}</div>
            <div class="text-caption text-grey-7">{{ currency?.code }} · API: Currencies (rates)</div>
          </div>
        </div>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <div v-if="loadingRate" class="flex flex-center q-pa-md">
          <q-spinner color="primary" size="2em" />
        </div>

        <q-banner v-else-if="rateError" dense class="bg-negative text-white rounded-borders q-mb-md">
          {{ rateError }}
        </q-banner>

        <div v-else class="bg-grey-1 q-pa-md rounded-borders text-subtitle1 text-weight-medium q-mb-md">
          1 {{ currency?.code }} = {{ usdRate !== null ? usdRate : 'N/A' }} USD
        </div>

        <div class="text-caption text-grey-8 q-mb-xs">
          Convertir monto en {{ currency?.code }}
        </div>
        <q-input
          v-model.number="amount"
          type="number"
          outlined
          dense
          min="0"
          class="q-mb-md"
        />

        <q-btn
          color="primary"
          label="Convertir a USD"
          no-caps
          class="full-width"
          :loading="loadingConvert"
          @click="handleConvert"
        />

        <div
          v-if="convertedAmount !== null"
          class="q-mt-md q-pa-sm bg-blue-1 text-blue-9 rounded-borders text-center text-weight-bold"
        >
          {{ amount }} {{ currency?.code }} = {{ convertedAmount }} USD
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { api } from '../services/api'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  currency: { type: Object, default: null }
})

defineEmits(['update:modelValue'])

const amount = ref(100)
const usdRate = ref(null)
const convertedAmount = ref(null)
const loadingRate = ref(false)
const loadingConvert = ref(false)
const rateError = ref(null)

watch(
  () => [props.modelValue, props.currency],
  async ([isOpen, curr]) => {
    if (!isOpen || !curr?.code) return
    convertedAmount.value = null
    rateError.value = null
    usdRate.value = null

    if (curr.code === 'USD') {
      usdRate.value = 1
      return
    }

    loadingRate.value = true
    try {
      const res = await api.getCurrencyRate(curr.code)
      const obj = res.data?.data?.objects?.[0]
      const rate = obj?.rates?.USD ?? obj?.USD ?? null
      usdRate.value = rate !== null ? Number(rate).toFixed(4) : null
    } catch (err) {
      rateError.value = 'No se pudo obtener la tasa de cambio.'
      console.error(err)
    } finally {
      loadingRate.value = false
    }
  }
)

const handleConvert = async () => {
  if (!props.currency?.code || !amount.value) return
  if (props.currency.code === 'USD') {
    convertedAmount.value = Number(amount.value).toFixed(2)
    return
  }

  loadingConvert.value = true
  rateError.value = null
  try {
    const res = await api.convertCurrency(props.currency.code, 'USD', amount.value)
    const obj = res.data?.data?.objects?.[0]
    const result = obj?.result ?? null
    convertedAmount.value = result !== null ? Number(result).toFixed(2) : 'Error'
  } catch (err) {
    rateError.value = 'Error al realizar la conversión.'
    console.error(err)
  } finally {
    loadingConvert.value = false
  }
}
</script>