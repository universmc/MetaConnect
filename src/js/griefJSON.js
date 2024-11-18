const fs = require("fs");
const path = require("path");

// Charger les fichiers JSON pour la politique de prix, les preuves de l’enquête, et les informations de l'enquête
const pricePolicyData = JSON.parse(fs.readFileSync("politique_des_prix.json", "utf8"));
const preuveData = JSON.parse(fs.readFileSync("elements_de_preuve.json", "utf8"));
const enqueteData = JSON.parse(fs.readFileSync("enquete.json", "utf8"));

// Structure du dossier judiciaire avec les éléments légaux et contextuels
const dossierJudiciaire = {
    titre: enqueteData.enquete.titre,
    description: enqueteData.enquete.description,
    objectifs: enqueteData.enquete.actions_recommandees || [],
    legalReferences: [
        { code: "Code électoral", articles: ["L53"], description: "Répression des abus financiers et manipulation pour intérêts personnels." },
        { code: "Code pénal", articles: ["313"], description: "Sanctions contre les escroqueries morales et la corruption." }
    ],
    sections: [],
    preuves: []
};

// Fonction pour ajouter les sections de l'enquête
function ajouterSectionsEnquete() {
    enqueteData.enquete.sections.forEach(section => {
        dossierJudiciaire.sections.push({
            titre: section.titre,
            details: section.details.map(detail => ({
                sujet: detail.sujet,
                description: detail.description,
                hypothese: detail.hypothese,
                articles_de_loi: detail.articles_de_loi || [],
                preuves: detail.preuves || []
            }))
        });
    });
}

// Fonction pour organiser les éléments de preuve
function ajouterPreuve(type, description, details, articleViolations) {
    dossierJudiciaire.preuves.push({
        type: type,
        description: description,
        details: details,
        articleViolations: articleViolations
    });
}

// Charger et organiser les éléments de preuve
function chargerPreuves() {
    if (Array.isArray(preuveData)) {
        preuveData.forEach(preuve => {
            ajouterPreuve(preuve.type, preuve.description, preuve.details, preuve.articleViolations);
        });
    } else {
        console.error("Erreur : 'preuveData' n'est pas un tableau. Vérifiez le format du fichier elements_de_preuve.json.");
    }
}

// Générer le dossier de preuves structuré en JSON
function genererDossierJSON() {
    return {
        titre: dossierJudiciaire.titre,
        description: dossierJudiciaire.description,
        objectifs: dossierJudiciaire.objectifs,
        legalReferences: dossierJudiciaire.legalReferences,
        sections: dossierJudiciaire.sections,
        preuves: dossierJudiciaire.preuves
    };
}

// Fonction principale pour exécuter l'analyse et sauvegarder le dossier en format JSON
async function main() {
    // Charger et organiser les sections de l'enquête
    ajouterSectionsEnquete();
    // Charger les preuves collectées
    chargerPreuves();

    // Générer l'objet JSON structuré du dossier
    const rapportDossierJSON = genererDossierJSON();

    // Enregistrer le rapport dans un fichier JSON pour transmission
    const outputFilePath = path.join(__dirname, `Dossier_Judiciaire_${new Date().toISOString().replace(/[-:TZ]/g, "")}.json`);
    fs.writeFileSync(outputFilePath, JSON.stringify(rapportDossierJSON, null, 2), "utf-8");
    console.log("Dossier judiciaire JSON généré et sauvegardé dans :", outputFilePath);
}

// Exécuter l'algorithme principal
main().catch(console.error);
