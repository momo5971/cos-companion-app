import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = "claude-3-5-sonnet-20241022";

async function callClaude(prompt) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 16000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function buildPrompt(questNotes, questName) {
  return `You are an expert at analyzing D&D adventure notes and creating decision flowcharts.

I need you to analyze the following quest notes from Curse of Strahd Reloaded and create a decision node structure for a flowchart system.

QUEST NAME: ${questName}

QUEST NOTES:
${questNotes}

INSTRUCTIONS:
1. Identify all major decision points, events, and outcomes in the quest
2. Create a hierarchical structure showing how choices lead to other choices
3. Include different node types:
   - "event": Something that happens automatically (no player choice)
   - "decision": Player makes a choice
   - "outcome": Result of a decision or event
4. Each node should have:
   - title: Short, descriptive title (in French if the notes are in French)
   - description: Brief description of what happens
   - nodeType: "event", "decision", or "outcome"
   - nextNodes: Array of indices pointing to connected nodes
   - consequences: What happens as a result (can be null for decisions)

OUTPUT FORMAT:
Return ONLY valid JavaScript code for the nodeDefinitions array, following this exact structure:

\`\`\`javascript
const nodeDefinitions = [
  {
    title: "Node Title",
    description: "What happens here",
    nodeType: "event",
    nextNodes: [1, 2], // indices of connected nodes
    consequences: "What results from this",
  },
  // ... more nodes
];
\`\`\`

IMPORTANT RULES:
- Use array indices (0, 1, 2, etc.) for nextNodes
- Keep titles concise (max 50 characters)
- Keep descriptions brief (max 100 characters)
- Consequences should be short (max 150 characters)
- Maintain the narrative flow from start to finish
- Include all major locations, encounters, and choices
- Terminal nodes (endings) should have empty nextNodes: []
- Start with index 0 as the entry point

Return ONLY the JavaScript code, no explanations or markdown formatting outside the code block.`;
}

async function generateDecisionNodes(questNotes, questName) {
  console.log(`\n🤖 Generating decision nodes for: ${questName}\n`);

  const prompt = buildPrompt(questNotes, questName);

  console.log("📡 Calling Claude API...\n");
  const response = await callClaude(prompt);

  // Extract code from response
  const codeMatch = response.match(/```javascript\n([\s\S]*?)\n```/);
  if (!codeMatch) {
    throw new Error("Could not extract JavaScript code from response");
  }

  const code = codeMatch[1];

  return code;
}

function createSeederTemplate(nodeDefinitionsCode, questName) {
  return `import DecisionNode from "../models/DecisionNode.js";
import Quest from "../models/Quest.js";

export const seed${questName.replace(/\s+/g, "")}DecisionNodes = async () => {
  try {
    // Get the quest
    const quest = await Quest.findOne({ title: "${questName}" });
    
    if (!quest) {
      console.log("${questName} quest not found, skipping decision node seeding");
      return;
    }

    // Delete existing nodes for this quest
    await DecisionNode.deleteMany({ questId: quest._id });

    // Define nodes with connections as indices
    ${nodeDefinitionsCode}

    // Add questId to all nodes and convert nextNodes indices to empty arrays
    const nodes = nodeDefinitions.map(node => ({
      ...node,
      questId: quest._id,
      nextNodes: [], // Will be populated after insertion
    }));

    const createdNodes = await DecisionNode.insertMany(nodes);

    // Now update all connections using the indices from nodeDefinitions
    for (let i = 0; i < nodeDefinitions.length; i++) {
      if (nodeDefinitions[i].nextNodes.length > 0) {
        await DecisionNode.findByIdAndUpdate(createdNodes[i]._id, {
          nextNodes: nodeDefinitions[i].nextNodes.map(index => createdNodes[index]._id),
        });
      }
    }

    console.log(\`\${questName} decision nodes seeded successfully (\${createdNodes.length} nodes)\`);
    return createdNodes;
  } catch (error) {
    console.error("Error seeding ${questName} decision nodes:", error);
    throw error;
  }
};
`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      "Usage: node generateDecisionNodes.js <notes-file> <quest-name>",
    );
    console.error(
      'Example: node generateDecisionNodes.js "Curse of Strahd Notes.txt" "Death House"',
    );
    process.exit(1);
  }

  const [notesFile, questName] = args;

  if (!ANTHROPIC_API_KEY) {
    console.error("❌ Error: ANTHROPIC_API_KEY environment variable not set");
    console.error("Set it with: export ANTHROPIC_API_KEY=your-api-key");
    process.exit(1);
  }

  try {
    // Read notes file
    const notesPath = path.resolve(notesFile);
    console.log(`📖 Reading notes from: ${notesPath}`);

    if (!fs.existsSync(notesPath)) {
      throw new Error(`Notes file not found: ${notesPath}`);
    }

    const questNotes = fs.readFileSync(notesPath, "utf-8");

    // Generate decision nodes
    const nodeDefinitionsCode = await generateDecisionNodes(
      questNotes,
      questName,
    );

    // Create seeder file
    const seederCode = createSeederTemplate(nodeDefinitionsCode, questName);

    // Write to file
    const outputFileName = `${questName.replace(/\s+/g, "")}DecisionNodeSeeder.js`;
    const outputPath = path.join(
      __dirname,
      "..",
      "Backend",
      "src",
      "seeders",
      outputFileName,
    );

    fs.writeFileSync(outputPath, seederCode);

    console.log(`✅ Success! Generated seeder file: ${outputFileName}`);
    console.log(`📁 Location: ${outputPath}`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. Review the generated file`);
    console.log(`2. Import it in runSeeders.js`);
    console.log(`3. Add the function call to the seeding sequence`);
    console.log(`4. Run: npm run seed`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
