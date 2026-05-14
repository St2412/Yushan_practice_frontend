<template>
  <div class="container">
    <header>
      <h1>簡易電商購物中心</h1>
      <nav>
        <RouterLink to="/products/create">商品新增</RouterLink>
        <RouterLink to="/orders/create">建立訂單</RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
