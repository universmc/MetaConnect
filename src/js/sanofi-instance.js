const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const https = require("https"); // Ajout pour gérer l'agent HTTPS
const Groq = require("groq-sdk");
const groq = new Groq();


// Définition des rôles de la procédure d'enquête
const roleSystem = {
    role: "system",
    content: "procédure d'enquête parlementaire sur l'affaire Sanofi",
};

const dossierJudiciairePath = "./dossier_judiciaire.json";

// Fonction principale pour gérer la procédure d'enquête
async function startEnqueteParlementaire(prompt) {
    const roleAssistant = {
        role: "assistant",
        content: prompt,
    };

    try {
        // Chargement ou création du fichier dossier_judiciaire.json
        let dossierJudiciaire = loadOrInitializeDossier();

        // Utilisation de Groq SDK pour analyser et optimiser les éléments de preuve
        const optimizedData = await optimizeData(roleAssistant.content);

        // Sauvegarde des résultats dans le dossier judiciaire
        saveDossierJudiciaire(dossierJudiciaire, optimizedData);

        console.log("Enquête mise à jour dans dossier_judiciaire.json");
    } catch (error) {
        console.error("Erreur durant la procédure d'enquête:", error);
    }
}

// Fonction pour optimiser les éléments de preuve et bilans de rapport d'expertise
async function optimizeData(content) {
    // Optimisation de requête Groq pour la collecte et l’analyse de données
    const query = `*[_type == "preuve" &&  keywords match "${content}"]{
        "id": _id,
        "titre": title,
        "description": description,
        "source": source,
        "date": date,
        "analyse": analyse,
        "impact": impact
    }`;

    const result = await groq.query(query);
    console.log("Données optimisées récupérées:", result);
    return result;
}

// Fonction pour charger ou initialiser le dossier judiciaire
function loadOrInitializeDossier() {
    if (fs.existsSync(dossierJudiciairePath)) {
        return JSON.parse(fs.readFileSync(dossierJudiciairePath, "utf-8"));
    } else {
        return { enquete: [], preuves: [], bilans: [] };
    }
}

// Fonction pour sauvegarder les données dans le fichier dossier judiciaire
function saveDossierJudiciaire(dossierJudiciaire, optimizedData) {
    // Ajout des données optimisées aux preuves et bilans existants
    dossierJudiciaire.preuves.push(...optimizedData);
    dossierJudiciaire.bilans.push({ date: new Date(), data: optimizedData });

    fs.writeFileSync(dossierJudiciairePath, JSON.stringify(dossierJudiciaire, null, 2));
}

// Exemple d’appel de l’instance d’enquête avec un prompt spécifique
const promptEnquete = "Analyse des relations financières et des impacts post-olympiques des décisions stratégiques de Sanofi";
startEnqueteParlementaire(promptEnquete);
