const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let dossierData;

// Charger le fichier JSON contenant les données de l'enquête
try {
    const jsonPath = path.join(__dirname, "enquete.json");
    if (fs.existsSync(jsonPath)) {
        const jsonContent = fs.readFileSync(jsonPath, "utf8");
        
        if (jsonContent) {
            dossierData = JSON.parse(jsonContent);
        } else {
            throw new Error("Le fichier enquete.json est vide.");
        }
    } else {
        throw new Error("Le fichier enquete.json n'existe pas dans le répertoire.");
    }
} catch (error) {
    console.error("Erreur lors du chargement de enquete.json :", error.message);
    process.exit(1);
}
// Fonction pour générer une instruction judiciaire pour l'agent AI `DetectiveAi`
function genererInstructionJudiciaire(dossierData) {
    return `
Instruction judiciaire pour l'enquêteur AI :

1. **Titre de l'enquête** : ${dossierData.investigation.title}
2. **Description de l'affaire** : ${dossierData.investigation.description || "Voir détails dans les sections."}
3. **Objectifs de l'enquête** :
${dossierData.investigation.objectifs?.map((objectif, i) => `   ${i + 1}. ${objectif}`).join("\n")}
4. **Cadre légal et articles de loi pertinents** :
${dossierData.investigation.sections.flatMap(section => section.legalReferences || []).map(ref => `   - Article ${ref.article} : ${ref.description}`).join("\n")}

5. **Directives pour l'analyse** :
   - Analyser chaque section de l'enquête et identifier les preuves d'abus de fonction ou de conflits d'intérêts.
   - Produire un rapport structuré sur chaque sujet abordé.
6. **Attente de l'enquêteur AI** :
   - Fournir des analyses et résumés clairs.
   - Relever les points de preuve pour chaque hypothèse.
   - Préparer des recommandations pour une instruction judiciaire plus approfondie, si nécessaire.
`;
}

// Fonction pour structurer le JSON pour la présentation dynamique
function genererPipelineJSON(dossierData) {
    return dossierData.investigation.sections.map(section => ({
        titre: section.title,
        sousSections: section.details?.examples.map(example => ({
            sousTitre: example.partyName || "Sans titre",
            contenu: `Description : ${example.description}\nSource : ${example.source || "Non spécifiée"}\nArticles de loi : ${section.legalReferences?.map(ref => ref.article).join(", ")}`
        })) || []
    }));
}

// Fonction pour générer le HTML sémantique en respectant les normes W3C
function genererHTML(dossierData, enquete) {
    const formattedTitle = enquete.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
    return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${formattedTitle}</title>
      <link rel="stylesheet" href="style_${enquete}.css">
    </head>
    <body>
      <header>
        <h1>${formattedTitle}</h1>
        <nav id="sommaire"></nav>
      </header>
      <main id="content"></main>
      <footer>
        <p>&copy; ${new Date().getFullYear()} - Projet ${formattedTitle}</p>
      </footer>
      <script src="script_${enquete}.js"></script>
    </body>
    </html>`;
}

// Générer le CSS pour le style de la présentation
function genererCSS() {
    return `
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px; }
    header, main, footer { max-width: 900px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
    header h1 { font-size: 2em; }
    #sommaire { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .sommaire-item { font-size: 1.1em; color: #007bff; text-decoration: none; }
    .sommaire-item:hover { color: #0056b3; text-decoration: underline; }
    section h2 { color: #007bff; font-size: 1.8em; margin-bottom: 10px; }
    article h3 { font-size: 1.4em; margin-top: 10px; color: #555; }
    footer { font-size: 0.9em; text-align: center; margin-top: 20px; }
    `;
}

// Générer le JavaScript pour charger dynamiquement le JSON et construire la page
function genererJavaScript(enquete) {
    return `
    document.addEventListener('DOMContentLoaded', function() {
      fetch('pipeline_${enquete}.json')
        .then(response => response.json())
        .then(pipeline => {
          const sommaire = document.getElementById('sommaire');
          const contenuCours = document.getElementById('content');

          pipeline.forEach((section, index) => {
            let sommaireItem = document.createElement('a');
            sommaireItem.href = \`#section\${index}\`;
            sommaireItem.textContent = section.titre;
            sommaireItem.classList.add("sommaire-item");
            sommaire.appendChild(sommaireItem);

            let sectionDiv = document.createElement('section');
            sectionDiv.id = \`section\${index}\`;
            
            let titreSection = document.createElement('h2');
            titreSection.textContent = section.titre;
            sectionDiv.appendChild(titreSection);

            section.sousSections.forEach(sousSection => {
              let sousSectionDiv = document.createElement('article');
              sousSectionDiv.classList.add("sous-section");

              let sousTitre = document.createElement('h3');
              sousTitre.textContent = sousSection.sousTitre;
              sousSectionDiv.appendChild(sousTitre);

              let contenu = document.createElement('p');
              contenu.textContent = sousSection.contenu;
              sousSectionDiv.appendChild(contenu);

              sectionDiv.appendChild(sousSectionDiv);
            });

            contenuCours.appendChild(sectionDiv);
          });
        });
    });
    `;
}

// Générer tous les fichiers nécessaires à la présentation visuelle du dossier judiciaire
function genererFichiersPresentation(enquete) {
    const htmlFile = `dist/page_${enquete}.html`;
    fs.writeFileSync(htmlFile, genererHTML(dossierData, enquete));
    console.log(`HTML sauvegardé dans ${htmlFile}`);

    const cssFile = `dist/style_${enquete}.css`;
    fs.writeFileSync(cssFile, genererCSS());
    console.log(`CSS sauvegardé dans ${cssFile}`);

    const jsFile = `dist/script_${enquete}.js`;
    fs.writeFileSync(jsFile, genererJavaScript(enquete));
    console.log(`JavaScript sauvegardé dans ${jsFile}`);

    const jsonFile = `dist/pipeline_${enquete}.json`;
    fs.writeFileSync(jsonFile, JSON.stringify(genererPipelineJSON(dossierData), null, 2));
    console.log(`JSON pipeline sauvegardé dans ${jsonFile}`);
}

// Envoi de l'instruction de justice via Groq SDK
async function envoyerInstructionEnquete() {
    const instruction = genererInstructionJudiciaire(dossierData);
    try {
        const response = await groq.chat.completions.create({
            messages: [
                { role: "assistant", name: "DetectiveAi", content: "Instruction judiciaire pour l'enquête sur la marque 'Élysée'." },
                { role: "system", content: instruction }
            ],
            model: "gemma2-9b-it",
            temperature: 0.7,
            max_tokens: 4096
        });
        
        console.log("Réponse de DetectiveAi :", response.choices[0]?.message?.content);
    } catch (error) {
        console.error("Erreur lors de l'envoi des résultats :", error);
    }
}

// Exécuter la génération des fichiers de présentation et envoyer l'instruction
const enquete = "dossier_judiciaire";
genererFichiersPresentation(enquete);
envoyerInstructionEnquete().catch(console.error);