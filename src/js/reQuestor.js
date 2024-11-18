const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Charger le fichier JSON contenant les données de l'enquête
const dossierData = JSON.parse(fs.readFileSync("dossier_judiciaire.json", "utf8"));

// Fonction pour formater les sections en JSON pour une présentation dynamique
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
// Générer le CSS pour le style de la présentation
function genererCSS() {
  return `
  * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
  }
  body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333;
      padding: 20px;
  }
  header, main, footer {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  header h1 {
      font-size: 2em;
      color: #007bff;
      text-align: center;
      margin-bottom: 15px;
  }
  #sommaire {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      background-color: #e9f5ff;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  .sommaire-item {
      font-size: 1.1em;
      color: #007bff;
      text-decoration: none;
      padding: 8px 10px;
      border-radius: 4px;
      transition: background-color 0.3s ease;
  }
  .sommaire-item:hover {
      background-color: #cfe7ff;
      color: #0056b3;
  }
  section {
      margin-top: 20px;
      padding: 15px;
      border-left: 4px solid #007bff;
      background-color: #f9f9f9;
      border-radius: 5px;
  }
  section h2 {
      font-size: 1.8em;
      color: #333;
      margin-bottom: 10px;
  }
  .sous-section {
      margin-top: 10px;
      padding-left: 15px;
      border-left: 2px solid #ddd;
  }
  article h3 {
      font-size: 1.4em;
      color: #555;
      margin-bottom: 5px;
  }
  article p {
      font-size: 1.1em;
      line-height: 1.6;
      text-align: justify;
      margin-bottom: 15px;
  }
  footer {
      font-size: 0.9em;
      text-align: center;
      margin-top: 20px;
      color: #777;
  }
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
            sommaire.appendChild(sommaireItem);

            let sectionDiv = document.createElement('section');
            sectionDiv.id = \`section\${index}\`;

            let titreSection = document.createElement('h2');
            titreSection.textContent = section.titre;
            sectionDiv.appendChild(titreSection);

            section.sousSections.forEach(sousSection => {
              let sousSectionDiv = document.createElement('article');
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
    // Générer et sauvegarder le fichier HTML
    const htmlFile = `dist/page_${enquete}.html`;
    fs.writeFileSync(htmlFile, genererHTML(dossierData, enquete));
    console.log(`HTML sauvegardé dans ${htmlFile}`);

    // Générer et sauvegarder le fichier CSS
    const cssFile = `dist/style_${enquete}.css`;
    fs.writeFileSync(cssFile, genererCSS());
    console.log(`CSS sauvegardé dans ${cssFile}`);

    // Générer et sauvegarder le fichier JavaScript
    const jsFile = `dist/script_${enquete}.js`;
    fs.writeFileSync(jsFile, genererJavaScript(enquete));
    console.log(`JavaScript sauvegardé dans ${jsFile}`);

    // Générer et sauvegarder le fichier JSON pour le pipeline
    const jsonFile = `dist/pipeline_${enquete}.json`;
    fs.writeFileSync(jsonFile, JSON.stringify(genererPipelineJSON(dossierData), null, 2));
    console.log(`JSON pipeline sauvegardé dans ${jsonFile}`);
}

// Exécuter la génération des fichiers de présentation
const enquete = "dossier_judiciaire";
genererFichiersPresentation(enquete);
