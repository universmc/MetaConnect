const fs = require("fs");
const Groq = require("groq-sdk");
const groq = new Groq();

const TOTAL_DURATION = 6 * 60 * 60 * 1000; // Limite de 6 heures pour le CTF
const SESSION_TIME = 30 * 60 * 1000; // 30 minutes pour chaque session de travail
const SHORT_BREAK_TIME = 5 * 60 * 1000; // 5 minutes de pause courte
const LONG_BREAK_TIME = 15 * 60 * 1000; // 15 minutes de pause longue
let ctfSessionCount = 0; // Compteur pour les sessions
let timeSpent = 0; // Temps total passé

// Contenu de la chronique (base des tâches)
const chronique = {
  title: "La Démocratie en Danger : Manifeste pour la Transparence et l'Intégrité",
  description: "Ce manifeste vise à sensibiliser et mobiliser les citoyens contre la fraude électorale, l'escroquerie financière en bande organisée, et la désinformation orchestrée.",
  sections: [
    {
      title: "Fraude électorale : Une atteinte à la volonté du peuple",
      tasks: [
        {
          description: "Recueillir des preuves de fraude électorale et documenter les cas de manipulation des bulletins et de corruption.",
          action: "Exigeons des audits et des contrôles indépendants pour garantir des élections transparentes.",
          legalReferences: ["Code électoral L52, L53"]
        }
      ]
    },
    {
      title: "Escroquerie financière en bande organisée",
      tasks: [
        {
          description: "Collecter des données sur les réseaux d’influence financiers et les mécanismes de corruption impliqués.",
          action: "Demandons la transparence et une législation stricte contre l'escroquerie financière en bande organisée.",
          legalReferences: ["Code pénal 313, 314, 340, 342"]
        }
      ]
    },
    {
      title: "Désinformation et propagande des milliardaires",
      tasks: [
        {
          description: "Étudier les campagnes de désinformation menées via les réseaux sociaux et les médias contrôlés.",
          action: "Réclamons la liberté et la diversité dans les médias pour garantir une information équilibrée.",
          legalReferences: ["Code pénal 431, 226"]
        }
      ]
    }
  ],
  conclusion: {
    content: "Il est impératif de se mobiliser pour garantir l'intégrité démocratique. Exigeons des réformes contre la manipulation électorale et financière.",
    action: "Ensemble, exigeons des réformes qui protègent nos droits et préservent l'intégrité de notre démocratie."
  }
};

// Fonction pour générer la documentation à chaque étape
function generateDocumentation(task, section) {
  const content = `
# Documentation pour ${section.title}

## Tâche
${task.description}

## Appel à l'action
${task.action}

## Références légales
${task.legalReferences.join(", ")}

## Détails supplémentaires
- Date de génération : ${new Date().toLocaleString()}
`;

  const outputFilePath = `CTF_${section.title.replace(/ /g, "_")}_${new Date().toISOString().replace(/[-:TZ]/g, "")}.md`;
  fs.writeFileSync(outputFilePath, content);
  console.log(`Documentation générée pour ${section.title} et sauvegardée dans ${outputFilePath}`);
}

// Fonction principale pour gérer le déroulement du CTF
async function main() {
  for (const section of chronique.sections) {
    for (const task of section.tasks) {
      if (timeSpent >= TOTAL_DURATION) {
        console.log("Durée maximale de 6 heures atteinte. Fin de la session CTF.");
        return;
      }

      console.log(`🔧 Début de la tâche : ${task.description}`);
      generateDocumentation(task, section);

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "Développer une analyse en fonction des preuves collectées pour le CTF." },
          { role: "user", content: `Analyse et recommandations pour ${section.title} : ${task.description}` }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0.6,
        max_tokens: 2048,
        top_p: 1,
        stream: false
      });

      const mdContent = chatCompletion.choices[0]?.message?.content;
      const outputFilePath = "CTF_Report_" + new Date().toISOString().replace(/[-:TZ]/g, "") + ".md";
      fs.writeFileSync(outputFilePath, mdContent);
      console.log(`Rapport généré pour ${section.title} et enregistré dans ${outputFilePath}`);

      // Démarrer les sessions pour la tâche
      startCTF(SESSION_TIME);
      if (timeSpent >= TOTAL_DURATION) return;
    }
  }
  console.log(`📌 Conclusion : ${chronique.conclusion.content}`);
}

// Fonction pour gérer les sessions de CTF dans le cadre de 6 heures
function startCTF(sessionTime) {
  console.log("⏳ Début d'une session de travail de 30 minutes.");
  timeSpent += sessionTime;

  // Gestion des pauses
  if (timeSpent >= TOTAL_DURATION) return;
  if (ctfSessionCount % 4 === 0 && ctfSessionCount > 0) {
    console.log("💡 Prendre une pause longue de 15 minutes.");
    timeSpent += LONG_BREAK_TIME;
  } else {
    console.log("⏸️ Pause courte de 5 minutes.");
    timeSpent += SHORT_BREAK_TIME;
  }

  ctfSessionCount++;
}

// Exécution de la fonction principale
main().catch(console.error);
