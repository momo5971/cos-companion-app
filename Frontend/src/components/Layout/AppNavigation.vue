<template>
  <nav class="gothic-nav">
    <div class="nav-border-top"></div>
    <div class="container mx-auto px-4">
      <div class="flex justify-center space-x-2 py-4">
        <router-link to="/quests" class="nav-link" active-class="active">
          <svg
            class="nav-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Quests</span>
        </router-link>
        <router-link to="/locations" class="nav-link" active-class="active">
          <svg
            class="nav-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span>Location Maps</span>
        </router-link>
        <router-link to="/compendium" class="nav-link" active-class="active">
          <svg
            class="nav-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span>Compendium</span>
        </router-link>
        <router-link to="/timeline" class="nav-link" active-class="active">
          <svg
            class="nav-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Timeline</span>
        </router-link>
      </div>
    </div>
    <div class="nav-border-bottom"></div>
  </nav>
</template>

<style scoped>
.gothic-nav {
  @apply bg-gradient-to-b from-strahd-darker via-strahd-dark to-strahd-darker;
  @apply relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.nav-border-top {
  @apply absolute top-0 left-0 right-0 h-0.5;
  background: linear-gradient(to right, transparent, #8b0000, transparent);
}

.nav-border-bottom {
  @apply absolute bottom-0 left-0 right-0 h-0.5;
  background: linear-gradient(to right, transparent, #8b0000, transparent);
}

.nav-link {
  @apply flex items-center gap-2 px-6 py-2.5 rounded-lg;
  @apply text-gray-300 font-semibold tracking-wide;
  @apply border-2 border-transparent;
  @apply transition-all duration-300;
  font-family: "Cinzel", serif;
}

.nav-link:hover {
  @apply text-strahd-gold border-strahd-red/30;
  @apply bg-strahd-darker/50;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
}

.nav-link.active {
  @apply text-strahd-red border-strahd-red;
  @apply bg-gradient-to-br from-strahd-darker to-black;
  text-shadow: 0 0 15px rgba(139, 0, 0, 0.8);
  box-shadow:
    0 0 20px rgba(139, 0, 0, 0.3),
    inset 0 0 10px rgba(139, 0, 0, 0.2);
}

.nav-icon {
  @apply w-5 h-5;
}

.nav-link.active .nav-icon {
  filter: drop-shadow(0 0 4px rgba(139, 0, 0, 0.8));
}
</style>
