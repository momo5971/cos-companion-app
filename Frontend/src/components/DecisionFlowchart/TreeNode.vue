<script setup>
defineProps({
  node: {
    type: Object,
    required: true,
  },
  childrenMap: {
    type: Object,
    required: true,
  },
  expandedNodes: {
    type: Set,
    required: true,
  },
  focusedNodeId: {
    type: String,
    default: null,
  },
});

defineEmits(["toggle", "select"]);
</script>

<template>
  <div class="tree-node">
    <div
      class="node-item"
      :class="{ focused: node._id === focusedNodeId }"
      @click="$emit('select', node._id)"
    >
      <button
        v-if="childrenMap[node._id]?.length > 0"
        @click.stop="$emit('toggle', node._id)"
        class="expand-btn"
      >
        {{ expandedNodes.has(node._id) ? "▼" : "▶" }}
      </button>
      <span v-else class="expand-spacer"></span>
      <span class="node-title">{{ node.title }}</span>
    </div>
    <div
      v-if="expandedNodes.has(node._id) && childrenMap[node._id]"
      class="node-children"
    >
      <TreeNode
        v-for="child in childrenMap[node._id]"
        :key="child._id"
        :node="child"
        :children-map="childrenMap"
        :expanded-nodes="expandedNodes"
        :focused-node-id="focusedNodeId"
        @toggle="$emit('toggle', $event)"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-node {
  margin-left: 0;
}

.node-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  gap: 0.5rem;
}

.node-item:hover {
  background: rgba(212, 175, 55, 0.1);
}

.node-item.focused {
  background: rgba(139, 0, 0, 0.3);
  border-left: 3px solid #8b0000;
}

.expand-btn {
  background: none;
  border: none;
  color: #d4af37;
  cursor: pointer;
  padding: 0;
  width: 1rem;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.expand-spacer {
  width: 1rem;
  flex-shrink: 0;
}

.node-title {
  color: #e0e0e0;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
}

.node-children {
  margin-left: 1.5rem;
  border-left: 1px solid rgba(212, 175, 55, 0.3);
  padding-left: 0.5rem;
}
</style>
