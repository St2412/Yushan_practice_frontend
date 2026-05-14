import axios from 'axios'

export class ApiError extends Error {
  constructor(payload = {}) {
    super(payload.message || '發生未知錯誤')
    this.name = 'ApiError'
    this.code = payload.code || 'UNKNOWN_ERROR'
    this.details = Array.isArray(payload.details) ? payload.details : []
    this.status = payload.status || 0
  }
}

const httpClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error
    if (response && response.data) {
      throw new ApiError({ ...response.data, status: response.status })
    }
    throw new ApiError({ message: error.message })
  }
)

export function unwrapApiResponse(response) {
  if (response?.data?.success === true) {
    return response.data.data
  }

  throw new ApiError({ message: 'API 回應格式錯誤', code: 'INVALID_API_RESPONSE' })
}

export default httpClient
