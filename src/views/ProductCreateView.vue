<script setup>
import { reactive, ref } from 'vue'
import { ApiError } from '../api/httpClient'
import { createProduct } from '../api/productApi'

const idRegex = /^[A-Za-z0-9_-]{1,50}$/

const form = reactive({
  productId: '',
  productName: '',
  price: '',
  quantity: ''
})

const clientErrors = ref([])
const apiError = ref(null)
const createdProduct = ref(null)

function validate() {
  const errors = []
  if (!idRegex.test(form.productId.trim())) errors.push('productId 格式不正確')
  const productName = form.productName.trim()
  if (!productName) errors.push('productName 不可空白')
  if (productName.length > 100) errors.push('productName 長度不可超過 100')
  if (/[<>]/.test(productName)) errors.push('productName 不可包含 < 或 >')
  if (!Number.isInteger(Number(form.price)) || Number(form.price) < 1) errors.push('price 必須為整數且 >= 1')
  if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 0) errors.push('quantity 必須為整數且 >= 0')

  clientErrors.value = errors
  return errors.length === 0
}

async function submit() {
  apiError.value = null
  clientErrors.value = []
  createdProduct.value = null
  if (!validate()) {
    apiError.value = new ApiError({
      message: '新增商品失敗',
      details: [...clientErrors.value]
    })
    clientErrors.value = []
    return
  }

  try {
    const result = await createProduct({
      productId: form.productId.trim(),
      productName: form.productName.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity)
    })
    createdProduct.value = result
  } catch (error) {
    if (error instanceof ApiError) {
      apiError.value = new ApiError({
        ...error,
        message: '新增商品失敗'
      })
    } else {
      apiError.value = new ApiError({ message: '新增商品失敗' })
    }
  }
}

function onProductNameInput(event) {
  form.productName = event.target.value.replace(/[<>]/g, '')
}
</script>

<template>
  <section class="card">
    <h2>商品新增</h2>
    <div class="form-row"><label>productId</label><input v-model="form.productId" maxlength="50" /></div>
    <div class="form-row"><label>productName</label><input :value="form.productName" maxlength="100" @input="onProductNameInput" /></div>
    <div class="form-row"><label>price</label><input v-model="form.price" type="number" min="1" step="1" /></div>
    <div class="form-row"><label>quantity</label><input v-model="form.quantity" type="number" min="0" step="1" /></div>
    <button type="button" @click="submit">新增商品</button>

    <ul v-if="clientErrors.length" class="error">
      <li v-for="(error, idx) in clientErrors" :key="idx">{{ error }}</li>
    </ul>

    <div v-if="apiError" class="error">
      <p>{{ apiError.message }}</p>
      <ul v-if="apiError.details.length">
        <li v-for="(detail, idx) in apiError.details" :key="idx">{{ detail }}</li>
      </ul>
    </div>

    <div v-if="createdProduct" class="success">
      <p>新增成功</p>
      <p>productId: {{ createdProduct.productId }}</p>
      <p>productName: {{ createdProduct.productName }}</p>
      <p>price: {{ createdProduct.price }}</p>
      <p>quantity: {{ createdProduct.quantity }}</p>
    </div>
  </section>
</template>