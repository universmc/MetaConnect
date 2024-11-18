const Groq = require('groq-sdk');
const fs = require('fs');

// Initialisation de Groq avec la clé API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Afficher toutes les méthodes disponibles dans groq-sdk
console.log("Available methods in groq:", Object.keys(groq));

// Définition des rôles
const roles = {
    assistant: {
        role: "assistant",
        description: "Répond aux requêtes et exécute les tâches selon les directives de system.",
        methods: {
            generatePrompt: (task) => `Analyzing task: ${task}.`,
            refinePrompt: (response) => `Reflect on the response: "${response}". Identify ambiguities and suggest improvements.`,
            executePrompt: (prompt) => `Execute and respond: "${prompt}".`
        }
    },
    system: {
        role: "system",
        description: "Oriente le rôle assistant en définissant des directives pour l'affinage des prompts et le cadre de travail.",
        methods: {
            setGuidelines: (task) => `Guideline for the task "${task}": Ensure clarity and depth.`,
            evaluatePrompt: (response) => `Evaluate the response: "${response}". Check for quality and coherence.`,
            suggestImprovements: () => `Suggest improvements for clarity and depth of information.`
        }
    }
};

// Fonction d'interaction entre assistant et system
function interaction(task) {
    // Le système génère des directives initiales
    const systemGuideline = roles.system.methods.setGuidelines(task);
    console.log(`System: ${systemGuideline}`);

    // L'assistant génère et affine le prompt selon les directives
    const initialPrompt = roles.assistant.methods.generatePrompt(task);
    const refinedPrompt = roles.assistant.methods.refinePrompt(initialPrompt);
    const finalExecution = roles.assistant.methods.executePrompt(refinedPrompt);

    console.log(`Assistant: Initial Prompt: ${initialPrompt}`);
    console.log(`Assistant: Refined Prompt: ${refinedPrompt}`);
    console.log(`Assistant: Final Execution: ${finalExecution}`);

    // Le système évalue et suggère des améliorations
    const evaluation = roles.system.methods.evaluatePrompt(finalExecution);
    const improvementSuggestion = roles.system.methods.suggestImprovements();

    console.log(`System Evaluation: ${evaluation}`);
    console.log(`System Suggestion: ${improvementSuggestion}`);

    // Retourne les résultats de l'interaction
    return { systemGuideline, initialPrompt, refinedPrompt, finalExecution, evaluation, improvementSuggestion };
}

// Appel de la fonction pour une tâche exemple
const interactionResult = interaction("Analyze customer feedback");

// Sauvegarde des interactions dans un fichier JSON pour un usage futur
fs.writeFileSync('autoPromptingInteraction.json', JSON.stringify(interactionResult, null, 2), 'utf-8');
console.log("Interaction saved successfully to autoPromptingInteraction.json");

// Alternative d'enregistrement si une méthode dans groq-sdk est trouvée
async function saveToGroq(data) {
    try {
        // Logique d'enregistrement avec groq-sdk ici si possible
        console.log("Attempting to save with Groq SDK...");
        // Remplacez `someMethod` avec la méthode correcte si elle existe
        // await groq.someMethod(data);
        console.log("Interaction saved successfully in Groq SDK.");
    } catch (error) {
        console.error("Failed to save interaction in Groq SDK:", error);
    }
}

// Appel de la sauvegarde avec Groq SDK si possible
saveToGroq(interactionResult);
