<template>
  <nav class="bg-strahd-dark border-b border-strahd-gray">
    <div class="container mx-auto px-4">
      <div class="flex justify-center space-x-8 py-4">
        <router-link to="/quests" class="nav-link" active-class="active">
          Quests
        </router-link>
        <router-link to="/locations" class="nav-link" active-class="active">
          Location Maps
        </router-link>
        <router-link to="/compendium" class="nav-link" active-class="active">
          Compendium
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-link {
  @apply text-gray-300 hover:text-strahd-red transition-colors px-4 py-2 rounded;
}
.nav-link.active {
  @apply text-strahd-red bg-strahd-darker;
}
</style>
