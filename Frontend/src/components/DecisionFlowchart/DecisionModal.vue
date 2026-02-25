<script setup>
import { computed } from "vue";
import { useDecisionNodeStore } from "../../stores/decisionNodeStore";

const decisionNodeStore = useDecisionNodeStore();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  node: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const connectedNodes = computed(() => {
  if (!props.node.nextNodes || props.node.nextNodes.length === 0) {
    return [];
  }
  return props.node.nextNodes.map((nodeId) => {
    const node = decisionNodeStore.nodes.find((n) => n._id === nodeId);
    return node ? node.title : "Unknown";
  });
});

const nodeTypeClass = computed(() => {
  const classes = {
    decision: "bg-blue-900 text-blue-100",
    outcome: "bg-green-900 text-green-100",
    event: "bg-purple-900 text-purple-100",
  };
  return classes[props.node.nodeType] || "bg-gray-700 text-gray-300";
});

const nodeIcon = computed(() => {
  const icons = {
    decision: "🔀",
    outcome: "🎯",
    event: "📜",
  };
  return icons[props.node.nodeType] || "📍";
});

function closeModal() {
  emit("close");
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-container" @click.stop>
          <!-- Close button -->
          <button class="close-btn" @click="closeModal">
            <span class="text-2xl">&times;</span>
          </button>

          <!-- Quest details -->
          <div class="modal-content">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-4xl">{{ nodeIcon }}</span>
              <h2 class="text-3xl font-bold text-strahd-red">
                {{ node.title }}
              </h2>
            </div>

            <div class="detail-section">
              <h3 class="section-title">Description</h3>
              <p class="text-gray-300">{{ node.description }}</p>
            </div>

            <div class="detail-section" v-if="node.consequences">
              <h3 class="section-title">Consequences</h3>
              <div class="consequences-box">
                <p class="text-gray-300">{{ node.consequences }}</p>
              </div>
            </div>

            <div class="detail-section">
              <h3 class="section-title">Type</h3>
              <span class="node-type-badge" :class="nodeTypeClass">
                {{ node.nodeType }}
              </span>
            </div>

            <div class="detail-section" v-if="connectedNodes.length > 0">
              <h3 class="section-title">Leads To</h3>
              <ul class="connected-nodes-list">
                <li
                  v-for="(nodeName, index) in connectedNodes"
                  :key="index"
                  class="text-gray-300 text-sm"
                >
                  → {{ nodeName }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: #16213e;
  border: 2px solid #ff6b6b;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  padding: 30px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  font-size: 30px;
  line-height: 1;
  transition: transform 0.2s;
}

.close-btn:hover {
  transform: scale(1.2);
}

.modal-content {
  color: #e0e0e0;
}

.detail-section {
  margin-bottom: 20px;
}

.connected-nodes-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.connected-nodes-list li {
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.connected-nodes-list li:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ff6b6b;
  margin-bottom: 8px;
}

.node-type-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
}

.consequences-box {
  background: rgba(255, 107, 107, 0.1);
  border-left: 3px solid #ff6b6b;
  padding: 12px;
  border-radius: 4px;
}

/* Modal transition */
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
