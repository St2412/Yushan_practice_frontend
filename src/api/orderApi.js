import httpClient, { unwrapApiResponse } from './httpClient'

export async function previewOrder(memberId) {
  const response = await httpClient.post('/orders/preview', { memberId })
  return unwrapApiResponse(response)
}

export async function createOrder(payload) {
  const response = await httpClient.post('/orders', payload)
  return unwrapApiResponse(response)
}
