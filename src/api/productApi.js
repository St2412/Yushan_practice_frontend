import httpClient, { unwrapApiResponse } from './httpClient'

export async function createProduct(payload) {
  const response = await httpClient.post('/products', payload)
  return unwrapApiResponse(response)
}

export async function getAvailableProducts() {
  const response = await httpClient.get('/products/available')
  return unwrapApiResponse(response)
}
