import { defineStore } from "pinia";
import { ref } from "vue";
import * as decisionNodeService from "../services/decisionNodeService";

export const useDecisionNodeStore = defineStore("decisionNode", () => {
  // State
  const nodes = ref([]);
  const currentNode = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Actions
  async function fetchNodesByQuest(questId) {
    loading.value = true;
    error.value = null;
    try {
      nodes.value = await decisionNodeService.getDecisionNodesByQuest(questId);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchNodeById(id) {
    loading.value = true;
    error.value = null;
    try {
      currentNode.value = await decisionNodeService.getDecisionNodeById(id);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function createNode(nodeData) {
    try {
      const newNode = await decisionNodeService.createDecisionNode(nodeData);
      nodes.value.push(newNode);
      return newNode;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function updateNode(id, nodeData) {
    try {
      const updatedNode = await decisionNodeService.updateDecisionNode(
        id,
        nodeData,
      );
      const index = nodes.value.findIndex((n) => n._id === id);
      if (index !== -1) {
        nodes.value[index] = updatedNode;
      }
      return updatedNode;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function updateNodeStatus(id, completed) {
  try {
    const updatedNode = await decisionNodeService.updateDecisionNodeStatus(id, completed);
    const index = nodes.value.findIndex((n) => n._id === id);
    if (index !== -1) {
      nodes.value[index].completed = completed;
    }
    return updatedNode;
  } catch (err) {
    error.value = err.message;
    throw err;
  }
}

  async function deleteNode(id) {
    try {
      await decisionNodeService.deleteDecisionNode(id);
      nodes.value = nodes.value.filter((n) => n._id !== id);
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  return {
    nodes,
    currentNode,
    loading,
    error,
    fetchNodesByQuest,
    fetchNodeById,
    createNode,
    updateNode,
    updateNodeStatus,
    deleteNode,
  };
});
