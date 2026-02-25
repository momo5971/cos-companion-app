<template>
  <div class="min-h-screen bg-strahd-dark text-gray-100">
    <AppHeader />
    <AppNavigation />
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppHeader from './components/Layout/AppHeader.vue'
import AppNavigation from './components/Layout/AppNavigation.vue'
</script>