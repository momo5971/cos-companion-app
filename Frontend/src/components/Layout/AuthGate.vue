<script setup>
import { ref } from "vue";
import axios from "axios";

const emit = defineEmits(["authenticated"]);

const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleSubmit() {
  error.value = "";
  loading.value = true;

  try {
    const baseURL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
      : "";
    const res = await axios.post(`${baseURL}/api/auth/verify`, {
      token: password.value,
    });

    if (res.data.valid) {
      localStorage.setItem("app-token", password.value);
      emit("authenticated");
    }
  } catch {
    error.value = "Wrong password. Try again.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-strahd-darker flex items-center justify-center px-4"
  >
    <div
      class="w-full max-w-sm bg-strahd-dark border-2 border-strahd-red rounded-xl p-8 shadow-glow-red"
    >
      <h1
        class="text-3xl font-bold text-strahd-red text-glow-red text-center mb-2"
      >
        Curse of Strahd
      </h1>
      <p
        class="text-strahd-gold text-sm text-center tracking-widest uppercase mb-8 opacity-80"
      >
        Campaign Companion
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <input
            v-model="password"
            type="password"
            placeholder="Enter password"
            class="input text-center"
            autocomplete="current-password"
            autofocus
          />
        </div>

        <p v-if="error" class="text-red-400 text-sm text-center">
          {{ error }}
        </p>

        <button
          type="submit"
          class="btn-primary w-full"
          :disabled="loading || !password"
        >
          {{ loading ? "Verifying..." : "Enter" }}
        </button>
      </form>
    </div>
  </div>
</template>
