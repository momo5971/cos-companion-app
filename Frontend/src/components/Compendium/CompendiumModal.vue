<script setup>
import { computed } from "vue";

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  entry: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

function handleClose() {
  emit("close");
}

// Get category color
function getCategoryColor(category) {
  const colors = {
    NPC: "bg-blue-500",
    Monster: "bg-red-500",
    Item: "bg-purple-500",
  };
  return colors[category] || "bg-gray-500";
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {
    NPC: "👤",
    Monster: "🐉",
    Item: "⚔️",
  };
  return icons[category] || "📖";
}

function getModifier(score) {
  const modifier = Math.floor((score - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

// Check if entry has specific fields
const hasNPCFields = computed(() => props.entry.category === "NPC");
const hasItemFields = computed(() => props.entry.category === "Item");
const hasStatBlock = computed(() => props.entry.statBlock);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-backdrop">
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <div class="header-content">
              <span
                class="category-badge"
                :class="getCategoryColor(entry.category)"
              >
                <span class="category-icon">{{
                  getCategoryIcon(entry.category)
                }}</span>
                {{ entry.category }}
              </span>
              <h3 class="modal-title">{{ entry.title }}</h3>
            </div>
            <button
              class="close-button"
              @click="handleClose"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <!-- Entry Image -->
            <div v-if="entry.imageUrl" class="entry-image-large">
              <img :src="entry.imageUrl" :alt="entry.title" />
            </div>

            <!-- Description -->
            <div class="section">
              <h4 class="section-title">Description</h4>
              <p class="section-text">{{ entry.description }}</p>
            </div>

            <!-- Details -->
            <div v-if="entry.details" class="section">
              <h4 class="section-title">Details</h4>
              <p class="section-text">{{ entry.details }}</p>
            </div>

            <!-- NPC-specific fields -->
            <template v-if="hasNPCFields">
              <div v-if="entry.motivation" class="section">
                <h4 class="section-title">Motivation</h4>
                <p class="section-text">{{ entry.motivation }}</p>
              </div>

              <div v-if="entry.personality" class="section">
                <h4 class="section-title">Personality</h4>
                <p class="section-text">{{ entry.personality }}</p>
              </div>
            </template>

            <!-- Item-specific fields -->
            <template v-if="hasItemFields">
              <div v-if="entry.rarity" class="section">
                <h4 class="section-title">Rarity</h4>
                <p class="section-text">{{ entry.rarity }}</p>
              </div>

              <div
                v-if="entry.properties && entry.properties.length > 0"
                class="section"
              >
                <h4 class="section-title">Properties</h4>
                <div class="tags">
                  <span
                    v-for="prop in entry.properties"
                    :key="prop"
                    class="tag"
                  >
                    {{ prop }}
                  </span>
                </div>
              </div>

              <div v-if="entry.attunement !== undefined" class="section">
                <h4 class="section-title">Attunement</h4>
                <p class="section-text">
                  {{ entry.attunement ? "Required" : "Not Required" }}
                </p>
              </div>
            </template>

            <!-- Location -->
            <div v-if="entry.location" class="section">
              <h4 class="section-title">Location</h4>
              <p class="section-text">{{ entry.location === 'Unknown' ? 'No Location' : entry.location }}</p>
            </div>

            <!-- Tags -->
            <div v-if="entry.tags && entry.tags.length > 0" class="section">
              <h4 class="section-title">Tags</h4>
              <div class="tags">
                <span v-for="tag in entry.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Stat Block (if available) -->
            <div
              v-if="hasStatBlock && entry.statBlock"
              class="stat-block-container"
            >
              <h4 class="section-title">Statistics</h4>

              <div class="stat-block">
                <!-- Header -->
                <div class="stat-header">
                  <div class="stat-creature-info">
                    <span class="stat-size">{{ entry.statBlock.size }}</span>
                    <span class="stat-type">{{ entry.statBlock.type }}</span>
                    <span v-if="entry.statBlock.alignment" class="stat-alignment">, {{ entry.statBlock.alignment }}</span>
                  </div>
                </div>

                <!-- Core Stats -->
                <div class="stat-row">
                  <div class="stat-item">
                    <span class="stat-label">AC</span>
                    <span class="stat-value">
                      {{ entry.statBlock.ac }}
                      <span v-if="entry.statBlock.acDescription" class="stat-detail-inline">({{ entry.statBlock.acDescription }})</span>
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">HP</span>
                    <span class="stat-value">
                      {{ entry.statBlock.hp }}
                      <span v-if="entry.statBlock.hitDice" class="stat-detail-inline">({{ entry.statBlock.hitDice }})</span>
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Speed</span>
                    <span class="stat-value">{{ entry.statBlock.speed }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">Initiative</span>
                    <span class="stat-value"
                      >+{{ entry.statBlock.initiativeBonus }}</span
                    >
                  </div>
                </div>

                <!-- Ability Scores -->
                <div v-if="entry.statBlock?.stats" class="abilities-grid">
                  <div class="ability">
                    <div class="ability-name">STR</div>
                    <div class="ability-score">
                      {{ entry.statBlock.stats.str }}
                    </div>
                    <div class="ability-modifier">
                      {{ getModifier(entry.statBlock.stats.str) }}
                    </div>
                  </div>
                  <div class="ability">
                    <div class="ability-name">DEX</div>
                    <div class="ability-score">
                      {{ entry.statBlock.stats.dex }}
                    </div>
                    <div class="ability-modifier">
                      {{ getModifier(entry.statBlock.stats.dex) }}
                    </div>
                  </div>
                  <div class="ability">
                    <div class="ability-name">CON</div>
                    <div class="ability-score">
                      {{ entry.statBlock.stats.con }}
                    </div>
                    <div class="ability-modifier">
                      {{ getModifier(entry.statBlock.stats.con) }}
                    </div>
                  </div>
                  <div class="ability">
                    <div class="ability-name">INT</div>
                    <div class="ability-score">
                      {{ entry.statBlock.stats.int }}
                    </div>
                    <div class="ability-modifier">
                      {{ getModifier(entry.statBlock.stats.int) }}
                    </div>
                  </div>
                  <div class="ability">
                    <div class="ability-name">WIS</div>
                    <div class="ability-score">
                      {{ entry.statBlock.stats.wis }}
                    </div>
                    <div class="ability-modifier">
                      {{ getModifier(entry.statBlock.stats.wis) }}
                    </div>
                  </div>
                  <div class="ability">
                    <div class="ability-name">CHA</div>
                    <div class="ability-score">
                      {{ entry.statBlock.stats.cha }}
                    </div>
                    <div class="ability-modifier">
                      {{ getModifier(entry.statBlock.stats.cha) }}
                    </div>
                  </div>
                </div>

                <!-- Saving Throws -->
                <div
                  v-if="entry.statBlock.savingThrows?.length"
                  class="stat-detail"
                >
                  <span class="detail-label">Saving Throws:</span>
                  <span class="detail-value">{{
                    entry.statBlock.savingThrows.join(", ")
                  }}</span>
                </div>

                <!-- Skills -->
                <div v-if="entry.statBlock.skills?.length" class="stat-detail">
                  <span class="detail-label">Skills:</span>
                  <span class="detail-value">{{
                    entry.statBlock.skills.join(", ")
                  }}</span>
                </div>

                <!-- Resistances/Immunities -->
                <div
                  v-if="entry.statBlock.damageResistances?.length"
                  class="stat-detail"
                >
                  <span class="detail-label">Damage Resistances:</span>
                  <span class="detail-value">{{
                    entry.statBlock.damageResistances.join(", ")
                  }}</span>
                </div>

                <div
                  v-if="entry.statBlock.damageImmunities?.length"
                  class="stat-detail"
                >
                  <span class="detail-label">Damage Immunities:</span>
                  <span class="detail-value">{{
                    entry.statBlock.damageImmunities.join(", ")
                  }}</span>
                </div>

                <div
                  v-if="entry.statBlock.conditionImmunities?.length"
                  class="stat-detail"
                >
                  <span class="detail-label">Condition Immunities:</span>
                  <span class="detail-value">{{
                    entry.statBlock.conditionImmunities.join(", ")
                  }}</span>
                </div>

                <!-- Senses -->
                <div v-if="entry.statBlock.senses" class="stat-detail">
                  <span class="detail-label">Senses:</span>
                  <span class="detail-value">{{ entry.statBlock.senses }}</span>
                </div>

                <!-- Languages -->
                <div v-if="entry.statBlock.languages" class="stat-detail">
                  <span class="detail-label">Languages:</span>
                  <span class="detail-value">{{
                    entry.statBlock.languages
                  }}</span>
                </div>

                <!-- Challenge Rating -->
                <div v-if="entry.statBlock.challengeRating" class="stat-detail">
                  <span class="detail-label">Challenge:</span>
                  <span class="detail-value">{{
                    entry.statBlock.challengeRating
                  }}</span>
                </div>

                <!-- Traits -->
                <div
                  v-if="entry.statBlock.traits?.length"
                  class="stat-features"
                >
                  <h5 class="features-title">Traits</h5>
                  <div
                    v-for="trait in entry.statBlock.traits"
                    :key="trait.name"
                    class="feature"
                  >
                    <strong>{{ trait.name }}.</strong> {{ trait.description }}
                  </div>
                </div>

                <!-- Actions -->
                <div
                  v-if="entry.statBlock.actions?.length"
                  class="stat-features"
                >
                  <h5 class="features-title">Actions</h5>
                  <div
                    v-for="action in entry.statBlock.actions"
                    :key="action.name"
                    class="feature"
                  >
                    <strong>{{ action.name }}.</strong> {{ action.description }}
                  </div>
                </div>

                <!-- Bonus Actions -->
                <div
                  v-if="entry.statBlock.bonusActions?.length"
                  class="stat-features"
                >
                  <h5 class="features-title">Bonus Actions</h5>
                  <div
                    v-for="action in entry.statBlock.bonusActions"
                    :key="action.name"
                    class="feature"
                  >
                    <strong>{{ action.name }}.</strong> {{ action.description }}
                  </div>
                </div>

                <!-- Reactions -->
                <div
                  v-if="entry.statBlock.reactions?.length"
                  class="stat-features"
                >
                  <h5 class="features-title">Reactions</h5>
                  <div
                    v-for="reaction in entry.statBlock.reactions"
                    :key="reaction.name"
                    class="feature"
                  >
                    <strong>{{ reaction.name }}.</strong>
                    {{ reaction.description }}
                  </div>
                </div>

                <!-- Legendary Actions -->
                <div
                  v-if="entry.statBlock.legendaryActions?.length"
                  class="stat-features"
                >
                  <h5 class="features-title">Legendary Actions</h5>
                  <div
                    v-for="action in entry.statBlock.legendaryActions"
                    :key="action.name"
                    class="feature"
                  >
                    <strong>{{ action.name }}.</strong> {{ action.description }}
                  </div>
                </div>

                <!-- Lair Actions -->
                <div
                  v-if="entry.statBlock.lairActions?.length"
                  class="stat-features"
                >
                  <h5 class="features-title">Lair Actions</h5>
                  <div
                    v-for="action in entry.statBlock.lairActions"
                    :key="action.name"
                    class="feature"
                  >
                    <strong>{{ action.name }}.</strong> {{ action.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="close-btn" @click="handleClose">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: #1e293b;
  border-radius: 12px;
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid #334155;
}

.header-content {
  flex: 1;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}

.category-icon {
  font-size: 14px;
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: 16px;
}

.close-button:hover {
  background: #334155;
  color: #f1f5f9;
}

.modal-content {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.entry-image-large {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 24px;
  background: #0f172a;
}

.entry-image-large img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.section-text {
  color: #e2e8f0;
  line-height: 1.6;
  font-size: 15px;
  white-space: pre-wrap;
  margin: 0;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 12px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  font-size: 13px;
  color: #94a3b8;
}

.stat-block-container {
  margin-top: 24px;
}

.stat-block {
  background: #0f172a;
  border: 2px solid #7c2d12;
  border-radius: 8px;
  padding: 20px;
  font-family: "Courier New", monospace;
}

.stat-header {
  border-bottom: 2px solid #7c2d12;
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.stat-creature-info {
  color: #fb923c;
  font-size: 14px;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.05em;
}

.stat-size {
  color: #fb923c;
}

.stat-type {
  color: #fb923c;
}

.stat-alignment {
  color: #94a3b8;
}

.stat-detail-inline {
  color: #94a3b8;
  font-size: 12px;
  font-weight: normal;
  margin-left: 4px;
}

.stat-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #334155;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.stat-value {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 700;
}

.abilities-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #334155;
}

.ability {
  text-align: center;
  background: #1e293b;
  border-radius: 6px;
  padding: 8px;
}

.ability-name {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
}

.ability-score {
  color: #e2e8f0;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 2px;
}

.ability-modifier {
  color: #fb923c;
  font-size: 13px;
  font-weight: 600;
}

.stat-detail {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
}

.detail-label {
  color: #94a3b8;
  font-weight: 600;
  min-width: 140px;
}

.detail-value {
  color: #e2e8f0;
}

.stat-features {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #334155;
}

.features-title {
  color: #fb923c;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 12px;
  letter-spacing: 0.05em;
}

.feature {
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.feature strong {
  color: #fb923c;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #334155;
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #2563eb;
}

/* Transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
