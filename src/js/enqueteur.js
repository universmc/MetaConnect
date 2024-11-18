const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");
const groq = new Groq();

// Charger le fichier JSON contenant les données de l'enquête
const dossierData = JSON.parse(fs.readFileSync("dossier_judiciaire.json", "utf8"));

// Fonction pour générer une réponse pour chaque section de l'enquête
function genererReponsePourSection(section) {
    const { titre, details } = section;
    let reponse = `### ${titre}\n\n`;

    details.forEach(detail => {
        reponse += `
#### Sujet : ${detail.sujet}
- **Description** : ${detail.description}
- **Hypothèse** : ${detail.hypothese}
- **Articles de loi** : ${detail.articles_de_loi ? detail.articles_de_loi.join(", ") : "Non spécifié"}
- **Preuves** : ${detail.preuves.length ? detail.preuves.join(", ") : "Aucune preuve documentée"}
`;
    });

    return reponse;
}

// Fonction pour générer la synthèse des preuves
function genererSynthesePreuves(preuves) {
    return preuves.map(preuve => `
### Type de preuve : ${preuve.type}
- **Description** : ${preuve.description}
- **Détails** : ${preuve.details}
- **Articles de loi violés** : ${preuve.articleViolations.join(", ")}
`).join("\n");
}

// Fonction principale pour exécuter l'enquête
async function enqueteur() {
    const { titre, description, objectifs, legalReferences, sections, preuves } = dossierData;
    
    // Générer la structure du rapport
    let rapport = `
# Rapport de l'Enquête : ${titre}

## Description
${description}

## Objectifs de l'enquête
${objectifs.join("\n")}

## Références légales
${legalReferences.map(ref => `- ${ref.code} Articles : ${ref.articles.join(", ")}, ${ref.description}`).join("\n")}

## Sections de l'Enquête
${sections.map(genererReponsePourSection).join("\n")}

## Preuves et éléments de suspicion
${genererSynthesePreuves(preuves)}
`;

    // Enregistrer le rapport dans un fichier pour documentation
    const outputFilePath = path.join(__dirname, `Rapport_Enqueteur_${new Date().toISOString().replace(/[-:TZ]/g, "")}.md`);
    fs.writeFileSync(outputFilePath, rapport, "utf-8");
    console.log("Rapport d'enquête généré et sauvegardé dans :", outputFilePath);

    // Envoyer la synthèse des résultats au juge par messagerie via groq-sdk
    const messages = [
        { role: "assistant", content: "Présentation des résultats de l'enquête sur l'exploitation commerciale de la marque 'Élysée'." },
        { role: "system", content: rapport },
        { role: "user", content: "Transmission au juge des éléments de preuve et analyse de l'affaire." }
    ];

    // Créer la réponse avec groq-sdk
    try {
        const response = await groq.chat.completions.create({
            messages,
            model: "gemma2-9b-it",
            temperature: 0.7,
            max_tokens: 4096,
        });

        const responseContent = response.choices[0]?.message?.content;
        console.log("Réponse de l'enquêteur :", responseContent);
    } catch (error) {
        console.error("Erreur lors de l'envoi des résultats :", error);
    }
}

// Exécuter le script d'enquête
enqueteur().catch(console.error);
