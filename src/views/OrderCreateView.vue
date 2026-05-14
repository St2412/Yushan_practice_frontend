<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ApiError } from '../api/httpClient'
import { getAvailableProducts } from '../api/productApi'
import { createOrder, previewOrder } from '../api/orderApi'

const idRegex = /^[A-Za-z0-9_-]{1,50}$/
const products = ref([])
const selectedMap = reactive({})
const qtyMap = reactive({})
const memberId = ref('')
const orderResult = ref(null)
const previewResult = ref(null)
const errorState = ref(null)
const clientErrors = ref([])

function normalizeOrderItems(payload) {
  if (!payload) return []
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.orderItems)) return payload.orderItems
  return []
}

async function fetchProducts() {
  products.value = await getAvailableProducts()
  for (const p of products.value) {
    if (!(p.productId in selectedMap)) selectedMap[p.productId] = false
    if (!(p.productId in qtyMap)) qtyMap[p.productId] = 1
  }
}

const localTotal = computed(() => products.value
  .filter((p) => selectedMap[p.productId])
  .reduce((sum, p) => sum + p.price * Number(qtyMap[p.productId] || 0), 0))

function validateOrder() {
  const errors = []
  if (!idRegex.test(memberId.value.trim())) errors.push('memberId 格式不正確')
  const selectedItems = products.value.filter((p) => selectedMap[p.productId])
  if (!selectedItems.length) errors.push('至少需選擇一項商品')
  for (const p of selectedItems) {
    const qty = Number(qtyMap[p.productId])
    if (!Number.isInteger(qty) || qty < 1) errors.push(`${p.productId} 數量需為整數且 >= 1`)
    if (qty > p.quantity) errors.push(`${p.productId} 購買數量不可大於庫存`)
  }
  clientErrors.value = errors
  return errors.length === 0
}

async function onPreview() {
  errorState.value = null
  try {
    previewResult.value = await previewOrder(memberId.value.trim())
  } catch (error) {
    errorState.value = error instanceof ApiError ? error : new ApiError({ message: '請稍後再試' })
  }
}

async function onCreateOrder() {
  errorState.value = null
  orderResult.value = null
  if (!validateOrder()) return

  const items = products.value
    .filter((p) => selectedMap[p.productId])
    .map((p) => ({ productId: p.productId, quantity: Number(qtyMap[p.productId]) }))

  try {
    orderResult.value = await createOrder({ memberId: memberId.value.trim(), items })
    await fetchProducts()
  } catch (error) {
    errorState.value = error instanceof ApiError ? error : new ApiError({ message: '請稍後再試' })
  }
}

onMounted(async () => {
  try {
    await fetchProducts()
  } catch (error) {
    errorState.value = error instanceof ApiError ? error : new ApiError({ message: '讀取商品失敗' })
  }
})
</script>

<template>
  <section class="card">
    <h2>建立訂單</h2>
    <div class="form-row"><label>memberId</label><input v-model="memberId" maxlength="50" /></div>

    <table>
      <thead>
        <tr><th>選擇</th><th>商品編號</th><th>商品名稱</th><th>單價</th><th>庫存</th><th>購買數量</th></tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.productId">
          <td><input v-model="selectedMap[product.productId]" type="checkbox" /></td>
          <td>{{ product.productId }}</td>
          <td>{{ product.productName }}</td>
          <td>{{ product.price }}</td>
          <td>{{ product.quantity }}</td>
          <td><input v-model="qtyMap[product.productId]" type="number" min="1" :max="product.quantity" step="1" /></td>
        </tr>
      </tbody>
    </table>

    <p>前端即時總計（顯示用）: {{ localTotal }}</p>
    <button type="button" @click="onPreview">查詢後端預覽</button>
    <button type="button" @click="onCreateOrder">建立訂單</button>

    <ul v-if="clientErrors.length" class="error">
      <li v-for="(error, idx) in clientErrors" :key="idx">{{ error }}</li>
    </ul>

    <div v-if="errorState" class="error">
      <p>{{ errorState.message }}</p>
      <ul v-if="errorState.details.length">
        <li v-for="(detail, idx) in errorState.details" :key="idx">{{ detail }}</li>
      </ul>
    </div>

    <div v-if="previewResult">
      <h3>後端預覽結果</h3>
      <p>memberId: {{ previewResult.memberId }}</p>
      <p>totalPrice: {{ previewResult.totalPrice }}</p>
      <template v-if="normalizeOrderItems(previewResult).length">
        <h4>會員旗下訂單明細</h4>
        <table>
          <thead>
            <tr>
              <th>商品編號</th>
              <th>商品名稱</th>
              <th>數量</th>
              <th>單價</th>
              <th>小計</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in normalizeOrderItems(previewResult)" :key="item.productId">
              <td>{{ item.productId }}</td>
              <td>{{ item.productName }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ item.standPrice }}</td>
              <td>{{ item.itemPrice }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>

    <div v-if="orderResult" class="success">
      <h3>建立成功</h3>
      <p>orderId: {{ orderResult.orderId }}</p>
      <p>memberId: {{ orderResult.memberId }}</p>
      <p>payStatus: {{ orderResult.payStatus }}</p>
      <p>totalPrice: {{ orderResult.totalPrice }}</p>
      <h4>訂單明細</h4>
      <table>
        <thead>
          <tr>
            <th>商品編號</th>
            <th>商品名稱</th>
            <th>數量</th>
            <th>單價</th>
            <th>小計</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in normalizeOrderItems(orderResult)" :key="item.productId">
            <td>{{ item.productId }}</td>
            <td>{{ item.productName }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ item.standPrice }}</td>
            <td>{{ item.itemPrice }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
