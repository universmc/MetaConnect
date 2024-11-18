const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Charger le fichier JSON contenant les données de l'enquête parlementaire
const dossierData = JSON.parse(fs.readFileSync("affaire_sanofi.json", "utf8"));

// Fonction pour générer l'instruction judiciaire pour l'enquêteur AI
function genererInstructionJudiciaire(dossierData) {
    return `
Instruction judiciaire pour l'enquêteur AI :

1. **Titre de l'enquête** : ${dossierData.titre}
2. **Description de l'affaire** : ${dossierData.description}
3. **Objectifs de l'enquête** :
${dossierData.objectifs.map((objectif, i) => `   ${i + 1}. ${objectif}`).join("\n")}
4. **Cadre légal et articles de loi pertinents** :
${dossierData.legalReferences.map(ref => `   - ${ref.code}, Articles : ${ref.articles.join(", ")}, ${ref.description}`).join("\n")}

5. **Directives pour l'analyse** :
   - Analyser chaque section et identifier les preuves d'abus de pouvoir, conflits d'intérêts ou fraudes.
   - Produire un rapport structuré pour chaque sous-section.
6. **Attentes de l'enquêteur AI** :
   - Fournir des analyses et résumés détaillés.
   - Identifier les points de preuve pour chaque hypothèse.
   - Préparer des recommandations pour une instruction judiciaire approfondie.
`;
}

// Fonction pour structurer le JSON pour la présentation dynamique
function genererPipelineJSON(dossierData) {
    return dossierData.sections.map(section => ({
        titre: section.titre,
        sousSections: section.details.map(detail => ({
            sousTitre: detail.sujet,
            contenu: `Description : ${detail.description}\nHypothèse : ${detail.hypothese}\nArticles de loi : ${detail.articles_de_loi.join(", ")}\nPreuves : ${detail.preuves.join(", ")}`
        }))
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
                { role: "system", content: "Procédure d'enquête parlementaire sur l'affaire Sanofi." },
                { role: "assistant", content: instruction }
            ],
            model: "gemma2-9b-it",
            temperature: 0.7,
            max_tokens: 4096,
        });
        
        console.log("Réponse de l'enquêteur :", response.choices[0]?.message?.content);
    } catch (error) {
        console.error("Erreur lors de l'envoi des résultats :", error);
    }
}

// Exécuter la génération des fichiers de présentation et envoyer l'instruction
const enquete = "dossier_judiciaire";
genererFichiersPresentation(enquete);
envoyerInstructionEnquete().catch(console.error);
