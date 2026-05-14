import { createRouter, createWebHistory } from 'vue-router'
import ProductCreateView from './views/ProductCreateView.vue'
import OrderCreateView from './views/OrderCreateView.vue'

const routes = [
  { path: '/', redirect: '/products/create' },
  { path: '/products/create', component: ProductCreateView },
  { path: '/orders/create', component: OrderCreateView }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
