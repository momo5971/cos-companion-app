<script setup>
import { ref } from "vue";
import { useCampaignStore } from "../../stores/campaignStore";

const emit = defineEmits(["close", "created"]);
const campaignStore = useCampaignStore();

const name = ref("");
const description = ref("");
const loading = ref(false);
const error = ref(null);

async function handleSubmit() {
  if (!name.value.trim()) {
    error.value = "Campaign name is required";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const newCampaign = await campaignStore.createCampaign({
      name: name.value.trim(),
      description: description.value.trim(),
      isActive: true,
    });
    emit("created", newCampaign);
  } catch (err) {
    error.value = err.message || "Failed to create campaign";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="modal-overlay"
  >
    <div
      class="modal-content animate-scale-in p-6 max-w-md w-full mx-4"
    >
      <h2 class="text-2xl font-bold text-strahd-red mb-4 text-glow-red">
        Create New Campaign
      </h2>

      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-strahd-gold mb-2">Campaign Name *</label>
          <input
            v-model="name"
            type="text"
            required
            class="input"
            placeholder="My Curse of Strahd Campaign"
            autocomplete="off"
          >
        </div>

        <div class="mb-4">
          <label class="block text-strahd-gold mb-2"
            >Description (Optional)</label
          >
          <textarea
            v-model="description"
            rows="3"
            class="textarea"
            placeholder="Started on 2024-01-15 with friends..." autocomplete="off"></textarea>
        </div>

        <div v-if="error" class="mb-4 text-red-500 text-sm animate-slide-down">
          {{ error }}
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? "Creating..." : "Create Campaign" }}
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
