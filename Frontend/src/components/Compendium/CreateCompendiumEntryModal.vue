<script setup>
import { ref, watch } from 'vue';
import { useLocationStore } from '../../stores/locationStore';
import { useQuestStore } from '../../stores/questStore';
import { useQuestSectionStore } from '../../stores/questSectionStore';
import { useCampaignStore } from '../../stores/campaignStore';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'created']);

const locationStore = useLocationStore();
const questStore = useQuestStore();
const questSectionStore = useQuestSectionStore();
const campaignStore = useCampaignStore();
const compendiumStore = useCompendiumStore();

import { useCompendiumStore } from '../../stores/compendiumStore';

const formData = ref({
  category: 'Quest',
  title: '',
  description: '',
  location: null,
  section: null,
  // NPC fields
  motivation: '',
  personality: '',
  // Item fields
  rarity: 'Common',
  properties: [],
  attunement: false,
  // Stat block fields
  includeStatBlock: false,
  statBlock: {
    size: 'Medium',
    type: '',
    alignment: 'Unaligned',
    initiativeBonus: 0,
    ac: 10,
    acDescription: '',
    hp: 10,
    hitDice: '',
    speed: '30 ft.',
    stats: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    },
    savingThrows: [],
    skills: [],
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: 'Passive Perception 10',
    languages: '—',
    challengeRating: '0',
    proficiencyBonus: 2,
    traits: [],
    actions: [],
    bonusActions: [],
    reactions: [],
    legendaryActions: [],
    legendaryActionsPerRound: 3,
    lairActions: []
  }
});

const categories = [
  { value: 'Quest', label: 'Quest' },
  { value: 'Location', label: 'Location' },
  { value: 'NPC', label: 'NPC' },
  { value: 'Monster', label: 'Monster' },
  { value: 'Item', label: 'Item' }
];

const rarityOptions = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'];

// Watch category changes to auto-enable stat block for monsters
watch(() => formData.value.category, (newCategory) => {
  if (newCategory === 'Monster') {
    formData.value.includeStatBlock = true;
  }
});

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm();
  }
});

function resetForm() {
  formData.value = {
    category: 'Quest',
    title: '',
    description: '',
    location: null,
    section: null,
    motivation: '',
    personality: '',
    rarity: 'Common',
    properties: [],
    attunement: false,
    includeStatBlock: false,
    statBlock: {
      size: 'Medium',
      type: '',
      alignment: 'Unaligned',
      initiativeBonus: 0,
      ac: 10,
      acDescription: '',
      hp: 10,
      hitDice: '',
      speed: '30 ft.',
      stats: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10
      },
      savingThrows: [],
      skills: [],
      damageVulnerabilities: [],
      damageResistances: [],
      damageImmunities: [],
      conditionImmunities: [],
      senses: 'Passive Perception 10',
      languages: '—',
      challengeRating: '0',
      proficiencyBonus: 2,
      traits: [],
      actions: [],
      bonusActions: [],
      reactions: [],
      legendaryActions: [],
      legendaryActionsPerRound: 3,
      lairActions: []
    }
  };
}

function addTrait() {
  formData.value.statBlock.traits.push({ name: '', description: '' });
}

function removeTrait(index) {
  formData.value.statBlock.traits.splice(index, 1);
}

function addAction() {
  formData.value.statBlock.actions.push({ name: '', description: '' });
}

function removeAction(index) {
  formData.value.statBlock.actions.splice(index, 1);
}

function addBonusAction() {
  formData.value.statBlock.bonusActions.push({ name: '', description: '' });
}

function removeBonusAction(index) {
  formData.value.statBlock.bonusActions.splice(index, 1);
}

function addReaction() {
  formData.value.statBlock.reactions.push({ name: '', description: '' });
}

function removeReaction(index) {
  formData.value.statBlock.reactions.splice(index, 1);
}

function addLegendaryAction() {
  formData.value.statBlock.legendaryActions.push({ name: '', description: '' });
}

function removeLegendaryAction(index) {
  formData.value.statBlock.legendaryActions.splice(index, 1);
}

function addLairAction() {
  formData.value.statBlock.lairActions.push({ name: '', description: '' });
}

function removeLairAction(index) {
  formData.value.statBlock.lairActions.splice(index, 1);
}

function handleClose() {
  emit('close');
}

async function handleSubmit() {
  if (!formData.value.title.trim() || !campaignStore.activeCampaign) {
    return;
  }

  try {
    const description = formData.value.description.trim() || 'No description provided.';
    
    if (formData.value.category === 'Quest') {
      // Create quest
      await questStore.createQuest({
        title: formData.value.title,
        description: description,
        campaignId: campaignStore.activeCampaign._id,
        location: formData.value.location || null,
        section: formData.value.section || null,
        status: 'available'
      });
    } else if (formData.value.category === 'Location') {
      // Create location
      await locationStore.createLocation({
        name: formData.value.title,
        description: description,
        campaignId: campaignStore.activeCampaign._id,
        type: 'region',
        parentLocation: null
      });
    } else if (formData.value.category === 'NPC') {
      // Create NPC compendium entry
      const entryData = {
        title: formData.value.title,
        description: description,
        category: 'NPC',
        campaignId: campaignStore.activeCampaign._id,
        tags: ['npc'],
        motivation: formData.value.motivation || '',
        personality: formData.value.personality || '',
        location: 'Unknown'
      };

      // Add stat block if included (clean it first)
      if (formData.value.includeStatBlock) {
        entryData.statBlock = cleanStatBlock(formData.value.statBlock);
      }

      await compendiumStore.createEntry(entryData);
    } else if (formData.value.category === 'Monster') {
      // Create Monster compendium entry (stat block required)
      await compendiumStore.createEntry({
        title: formData.value.title,
        description: description,
        category: 'Monster',
        campaignId: campaignStore.activeCampaign._id,
        tags: ['monster'],
        location: 'Unknown',
        statBlock: cleanStatBlock(formData.value.statBlock)
      });
    } else if (formData.value.category === 'Item') {
      // Create Item compendium entry
      await compendiumStore.createEntry({
        title: formData.value.title,
        description: description,
        category: 'Item',
        campaignId: campaignStore.activeCampaign._id,
        tags: ['item', formData.value.rarity.toLowerCase()],
        rarity: formData.value.rarity,
        properties: formData.value.properties,
        attunement: formData.value.attunement,
        location: 'Unknown'
      });
    }

    emit('created');
    handleClose();
  } catch (error) {
    console.error('Error creating entry:', error);
  }
}

// Clean stat block by removing empty entries and ensuring required fields
function cleanStatBlock(statBlock) {
  const filterAbilities = (abilities) => {
    return (abilities || [])
      .filter(item => item.name && item.name.trim() !== '')
      .map(item => ({
        name: item.name.trim(),
        description: item.description ? item.description.trim() : ''
      }));
  };

  return {
    size: statBlock.size,
    type: statBlock.type,
    alignment: statBlock.alignment,
    initiativeBonus: statBlock.initiativeBonus,
    ac: statBlock.ac,
    acDescription: statBlock.acDescription || '',
    hp: statBlock.hp,
    hitDice: statBlock.hitDice || '',
    speed: statBlock.speed,
    stats: statBlock.stats,
    savingThrows: statBlock.savingThrows || [],
    skills: statBlock.skills || [],
    damageVulnerabilities: statBlock.damageVulnerabilities || [],
    damageResistances: statBlock.damageResistances || [],
    damageImmunities: statBlock.damageImmunities || [],
    conditionImmunities: statBlock.conditionImmunities || [],
    senses: statBlock.senses,
    languages: statBlock.languages,
    challengeRating: statBlock.challengeRating,
    proficiencyBonus: statBlock.proficiencyBonus,
    traits: filterAbilities(statBlock.traits),
    actions: filterAbilities(statBlock.actions),
    bonusActions: filterAbilities(statBlock.bonusActions),
    reactions: filterAbilities(statBlock.reactions),
    legendaryActions: filterAbilities(statBlock.legendaryActions),
    legendaryActionsPerRound: statBlock.legendaryActionsPerRound,
    lairActions: filterAbilities(statBlock.lairActions)
  };
}
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Create Compendium Entry</h3>
        <button class="close-btn" @click="handleClose">&times;</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Category Selection -->
        <div class="form-group">
          <label class="form-label">Category</label>
          <select v-model="formData.category" class="form-select">
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
        </div>

        <!-- Title -->
        <div class="form-group">
          <label class="form-label">Title</label>
          <input
            v-model="formData.title"
            type="text"
            class="form-input"
            placeholder="Enter title"
            required
            autocomplete="off"
          />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea
            v-model="formData.description"
            class="form-textarea"
            rows="4"
            placeholder="Enter description"
            autocomplete="off"
          ></textarea>
        </div>

        <!-- Quest-specific fields -->
        <template v-if="formData.category === 'Quest'">
          <!-- Location -->
          <div class="form-group">
            <label class="form-label">Location (Optional)</label>
            <select v-model="formData.location" class="form-select">
              <option :value="null">No Location</option>
              <option
                v-for="location in locationStore.locations"
                :key="location._id"
                :value="location._id"
              >
                {{ location.name }}
              </option>
            </select>
          </div>

          <!-- Section -->
          <div class="form-group">
            <label class="form-label">Section (Optional)</label>
            <select v-model="formData.section" class="form-select">
              <option :value="null">No Section</option>
              <option
                v-for="section in questSectionStore.sections"
                :key="section._id"
                :value="section._id"
              >
                {{ section.name }}
              </option>
            </select>
          </div>
        </template>

        <!-- NPC-specific fields -->
        <template v-if="formData.category === 'NPC'">
          <div class="form-group">
            <label class="form-label">Motivation (Optional)</label>
            <textarea
              v-model="formData.motivation"
              class="form-textarea"
              rows="3"
              placeholder="What drives this NPC?"
              autocomplete="off"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Personality (Optional)</label>
            <textarea
              v-model="formData.personality"
              class="form-textarea"
              rows="3"
              placeholder="Describe their personality traits"
              autocomplete="off"
            ></textarea>
          </div>
        </template>

        <!-- Stat Block Section (for NPCs and Monsters) -->
        <template v-if="formData.category === 'NPC' || formData.category === 'Monster'">
          <div class="form-group">
            <label class="form-label">
              <input
                v-model="formData.includeStatBlock"
                type="checkbox"
                class="form-checkbox"
                :disabled="formData.category === 'Monster'"
              />
              Include Stat Block {{ formData.category === 'Monster' ? '(Required)' : '(Optional)' }}
            </label>
          </div>

          <div v-if="formData.includeStatBlock" class="stat-block-section">
            <h4 class="section-title">Stat Block</h4>

            <!-- Size, Type, Alignment -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Size</label>
                <select v-model="formData.statBlock.size" class="form-select">
                  <option value="Tiny">Tiny</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Huge">Huge</option>
                  <option value="Gargantuan">Gargantuan</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Type</label>
                <input
                  v-model="formData.statBlock.type"
                  type="text"
                  class="form-input"
                  placeholder="e.g., humanoid, beast"
                  :required="formData.includeStatBlock"
                  autocomplete="off"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Alignment</label>
                <input
                  v-model="formData.statBlock.alignment"
                  type="text"
                  class="form-input"
                  placeholder="e.g., Lawful Good"
                  autocomplete="off"
                />
              </div>
            </div>

            <!-- Combat Stats -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">AC</label>
                <input
                  v-model.number="formData.statBlock.ac"
                  type="number"
                  class="form-input"
                  autocomplete="off"
                />
              </div>
              <div class="form-group">
                <label class="form-label">AC Description</label>
                <input
                  v-model="formData.statBlock.acDescription"
                  type="text"
                  class="form-input"
                  placeholder="e.g., natural armor"
                  autocomplete="off"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">HP</label>
                <input
                  v-model.number="formData.statBlock.hp"
                  type="number"
                  class="form-input"
                  autocomplete="off"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Hit Dice</label>
                <input
                  v-model="formData.statBlock.hitDice"
                  type="text"
                  class="form-input"
                  placeholder="e.g., 8d8+16"
                  autocomplete="off"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Speed</label>
                <input
                  v-model="formData.statBlock.speed"
                  type="text"
                  class="form-input"
                  placeholder="30 ft."
                  autocomplete="off"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Initiative</label>
                <input
                  v-model.number="formData.statBlock.initiativeBonus"
                  type="number"
                  class="form-input"
                  autocomplete="off"
                />
              </div>
              <div class="form-group">
                <label class="form-label">CR</label>
                <input
                  v-model="formData.statBlock.challengeRating"
                  type="text"
                  class="form-input"
                  placeholder="0"
                  autocomplete="off"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Prof. Bonus</label>
                <input
                  v-model.number="formData.statBlock.proficiencyBonus"
                  type="number"
                  class="form-input"
                  autocomplete="off"
                />
              </div>
            </div>

            <!-- Ability Scores -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">STR</label>
                <input
                  v-model.number="formData.statBlock.stats.str"
                  type="number"
                  class="form-input"
                  autocomplete="off"
                />
              </div>
              <div class="form-group">
                <label class="form-label">DEX</label>
                <input
                  v-model.number="formData.statBlock.stats.dex"
                  type="number"
                  class="form-input"
                  autocomplete="off"
                />
              </div>
              <div class="form-group">
                <label class="form-label">CON</label>
                <input
                  v-model.number="formData.statBlock.stats.con"
                  type="number"
                  class="form-input"
                  autocomplete="off"
                />
              </div>
              <div class="form-group">
                <label class="form-label">INT</label>
                <input
                  v-model.number="formData.statBlock.stats.int"
                  type="number"
                  class="form-input"
                  autocomplete="off"
                />
              </div>
              <div class="form-group">
                <label class="form-label">WIS</label>
                <input
                  v-model.number="formData.statBlock.stats.wis"
                  type="number"
                  class="form-input"
                  autocomplete="off"
                />
              </div>
              <div class="form-group">
                <label class="form-label">CHA</label>
                <input
                  v-model.number="formData.statBlock.stats.cha"
                  type="number"
                  class="form-input"
                  autocomplete="off"
                />
              </div>
            </div>

            <!-- Additional Info -->
            <div class="form-group">
              <label class="form-label">Senses</label>
              <input
                v-model="formData.statBlock.senses"
                type="text"
                class="form-input"
                placeholder="Passive Perception 10"
                autocomplete="off"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Languages</label>
              <input
                v-model="formData.statBlock.languages"
                type="text"
                class="form-input"
                placeholder="Common"
                autocomplete="off"
              />
            </div>

            <!-- Traits -->
            <div class="form-group">
              <div class="flex items-center justify-between mb-2">
                <label class="form-label mb-0">Traits</label>
                <button type="button" @click="addTrait" class="btn-add">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add Trait
                </button>
              </div>
              <div v-for="(trait, index) in formData.statBlock.traits" :key="index" class="ability-item">
                <input
                  v-model="trait.name"
                  type="text"
                  class="form-input mb-2"
                  placeholder="Trait name"
                  autocomplete="off"
                />
                <textarea
                  v-model="trait.description"
                  class="form-textarea mb-2"
                  rows="2"
                  placeholder="Trait description"
                  autocomplete="off"
                ></textarea>
                <button type="button" @click="removeTrait(index)" class="btn-remove">Remove</button>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-group">
              <div class="flex items-center justify-between mb-2">
                <label class="form-label mb-0">Actions</label>
                <button type="button" @click="addAction" class="btn-add">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add Action
                </button>
              </div>
              <div v-for="(action, index) in formData.statBlock.actions" :key="index" class="ability-item">
                <input
                  v-model="action.name"
                  type="text"
                  class="form-input mb-2"
                  placeholder="Action name"
                  autocomplete="off"
                />
                <textarea
                  v-model="action.description"
                  class="form-textarea mb-2"
                  rows="2"
                  placeholder="Action description"
                  autocomplete="off"
                ></textarea>
                <button type="button" @click="removeAction(index)" class="btn-remove">Remove</button>
              </div>
            </div>

            <!-- Bonus Actions -->
            <div class="form-group">
              <div class="flex items-center justify-between mb-2">
                <label class="form-label mb-0">Bonus Actions</label>
                <button type="button" @click="addBonusAction" class="btn-add">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add Bonus Action
                </button>
              </div>
              <div v-for="(action, index) in formData.statBlock.bonusActions" :key="index" class="ability-item">
                <input
                  v-model="action.name"
                  type="text"
                  class="form-input mb-2"
                  placeholder="Bonus action name"
                  autocomplete="off"
                />
                <textarea
                  v-model="action.description"
                  class="form-textarea mb-2"
                  rows="2"
                  placeholder="Bonus action description"
                  autocomplete="off"
                ></textarea>
                <button type="button" @click="removeBonusAction(index)" class="btn-remove">Remove</button>
              </div>
            </div>

            <!-- Reactions -->
            <div class="form-group">
              <div class="flex items-center justify-between mb-2">
                <label class="form-label mb-0">Reactions</label>
                <button type="button" @click="addReaction" class="btn-add">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add Reaction
                </button>
              </div>
              <div v-for="(reaction, index) in formData.statBlock.reactions" :key="index" class="ability-item">
                <input
                  v-model="reaction.name"
                  type="text"
                  class="form-input mb-2"
                  placeholder="Reaction name"
                  autocomplete="off"
                />
                <textarea
                  v-model="reaction.description"
                  class="form-textarea mb-2"
                  rows="2"
                  placeholder="Reaction description"
                  autocomplete="off"
                ></textarea>
                <button type="button" @click="removeReaction(index)" class="btn-remove">Remove</button>
              </div>
            </div>

            <!-- Legendary Actions -->
            <div class="form-group">
              <div class="flex items-center justify-between mb-2">
                <label class="form-label mb-0">Legendary Actions</label>
                <button type="button" @click="addLegendaryAction" class="btn-add">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add Legendary Action
                </button>
              </div>
              <div v-for="(action, index) in formData.statBlock.legendaryActions" :key="index" class="ability-item">
                <input
                  v-model="action.name"
                  type="text"
                  class="form-input mb-2"
                  placeholder="Legendary action name"
                  autocomplete="off"
                />
                <textarea
                  v-model="action.description"
                  class="form-textarea mb-2"
                  rows="2"
                  placeholder="Legendary action description"
                  autocomplete="off"
                ></textarea>
                <button type="button" @click="removeLegendaryAction(index)" class="btn-remove">Remove</button>
              </div>
            </div>

            <!-- Lair Actions -->
            <div class="form-group">
              <div class="flex items-center justify-between mb-2">
                <label class="form-label mb-0">Lair Actions</label>
                <button type="button" @click="addLairAction" class="btn-add">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add Lair Action
                </button>
              </div>
              <div v-for="(action, index) in formData.statBlock.lairActions" :key="index" class="ability-item">
                <input
                  v-model="action.name"
                  type="text"
                  class="form-input mb-2"
                  placeholder="Lair action name"
                  autocomplete="off"
                />
                <textarea
                  v-model="action.description"
                  class="form-textarea mb-2"
                  rows="2"
                  placeholder="Lair action description"
                  autocomplete="off"
                ></textarea>
                <button type="button" @click="removeLairAction(index)" class="btn-remove">Remove</button>
              </div>
            </div>
          </div>
        </template>

        <!-- Item-specific fields -->
        <template v-if="formData.category === 'Item'">
          <div class="form-group">
            <label class="form-label">Rarity</label>
            <select v-model="formData.rarity" class="form-select">
              <option v-for="rarity in rarityOptions" :key="rarity" :value="rarity">
                {{ rarity }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              <input
                v-model="formData.attunement"
                type="checkbox"
                class="form-checkbox"
              />
              Requires Attunement
            </label>
          </div>
        </template>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="handleClose">
            Cancel
          </button>
          <button type="submit" class="btn-primary">
            Create {{ formData.category }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
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

.modal-content {
  background: #1e293b;
  border: 2px solid #8b0000;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 30px rgba(139, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #334155;
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #8b0000;
  margin: 0;
}

.close-btn {
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
}

.close-btn:hover {
  background: #334155;
  color: #f1f5f9;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #d4af37;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  background: #0f172a;
  border: 2px solid #334155;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-checkbox {
  width: auto;
  margin-right: 8px;
  cursor: pointer;
}

.stat-block-section {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #d4af37;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.form-row .form-group {
  margin-bottom: 0;
}

.ability-item {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #d4af37;
  border-radius: 6px;
  color: #d4af37;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: rgba(212, 175, 55, 0.1);
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.btn-remove {
  padding: 6px 12px;
  background: rgba(139, 0, 0, 0.8);
  border: 1px solid #8b0000;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #a00000;
  box-shadow: 0 0 10px rgba(139, 0, 0, 0.5);
}

.mb-0 {
  margin-bottom: 0;
}

.mb-2 {
  margin-bottom: 8px;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #334155;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid;
}

.btn-primary {
  background: #8b0000;
  border-color: #8b0000;
  color: white;
}

.btn-primary:hover {
  background: #a00000;
  box-shadow: 0 0 20px rgba(139, 0, 0, 0.5);
}

.btn-secondary {
  background: transparent;
  border-color: #334155;
  color: #94a3b8;
}

.btn-secondary:hover {
  border-color: #d4af37;
  color: #d4af37;
}
</style>
