import { useRouter } from "vue-router";
import { useCompendiumStore } from "../stores/compendiumStore";
import { useCampaignStore } from "../stores/campaignStore";

export function useCompendiumNavigation() {
  const router = useRouter();
  const compendiumStore = useCompendiumStore();
  const campaignStore = useCampaignStore();

  /**
   * Navigate to compendium and open entry by title and category
   * @param {string} title - The title of the entry to find
   * @param {string} category - The category (Quest, Location, NPC, Monster, Item)
   */
  async function navigateToCompendiumEntry(title, category) {
    if (!title || !category) return;

    // Navigate to compendium view with query parameters
    await router.push({
      name: "Compendium",
      query: {
        openEntry: title,
        category: category,
      },
    });
  }

  return {
    navigateToCompendiumEntry,
  };
}
