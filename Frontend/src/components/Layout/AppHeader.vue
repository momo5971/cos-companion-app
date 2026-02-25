<script setup>
import { ref, computed } from "vue";
import { useCampaignStore } from "../../stores/campaignStore";
import CampaignSelector from "../Campaign/CampaignSelector.vue";
import ManageCampaignsModal from "../Campaign/ManageCampaignsModal.vue";

const campaignStore = useCampaignStore();
const showManageModal = ref(false);

const hasActiveCampaign = computed(() => campaignStore.hasActiveCampaign);
const saveStatus = computed(() => campaignStore.saveStatus);
</script>

<template>
  <header class="relative bg-gradient-to-b from-strahd-darker via-strahd-dark to-strahd-darker border-b-2 border-strahd-red shadow-glow-red">
    <!-- Decorative top border -->
    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-strahd-red to-transparent opacity-50"></div>
    
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-between">
        <!-- Title with dramatic styling -->
        <div class="relative">
          <h1 class="text-5xl font-bold text-strahd-red text-glow-red tracking-wide">
            Curse of Strahd
          </h1>
          <p class="text-strahd-gold text-sm tracking-widest uppercase mt-1 opacity-80">
            Reloaded Campaign Companion
          </p>
          <!-- Decorative underline -->
          <div class="absolute -bottom-2 left-0 w-32 h-0.5 bg-gradient-to-r from-strahd-red to-transparent"></div>
        </div>

        <div class="flex items-center gap-6">
          <!-- Save Status Indicator with icon -->
          <div v-if="hasActiveCampaign" class="flex items-center gap-2 px-3 py-2 bg-strahd-dark/50 rounded-lg border border-strahd-red/30">
            <div class="relative">
              <span v-if="saveStatus === 'saved'" class="flex items-center gap-2 text-green-400">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm font-semibold">Saved</span>
              </span>
              <span v-else-if="saveStatus === 'saving'" class="flex items-center gap-2 text-yellow-400">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm font-semibold">Saving...</span>
              </span>
              <span v-else-if="saveStatus === 'error'" class="flex items-center gap-2 text-red-400">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm font-semibold">Error</span>
              </span>
            </div>
          </div>

          <!-- Campaign Selector -->
          <CampaignSelector />

          <!-- Manage Campaigns Button with enhanced styling -->
          <button
            @click="showManageModal = true"
            class="btn-secondary shadow-lg hover:shadow-glow-gold transition-smooth"
          >
            <span class="flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
              </svg>
              Manage Campaigns
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Decorative bottom border -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-strahd-red to-transparent opacity-30"></div>

    <!-- Manage Campaigns Modal -->
    <ManageCampaignsModal
      v-if="showManageModal"
      @close="showManageModal = false"
    />
  </header>
</template>
