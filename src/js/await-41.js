const fs = require("fs");
const Groq = require("groq-sdk");
const groq = new Groq();
const db = new Groq({});

async function main() {
    
// Algorithme pour ajouter les entreprises impliquées dans les suspicions d'évasion fiscale, blanchiment d'argent, etc.
async function Investigation(investigation) {
  // Assurez-vous d'avoir une base de données avec une table 'companies' contenant les champs 'name' et 'status'
  const companies = await db.companies.where("status", "sold" || "relocated").select();

  investigation.companies = [];
  for (const company of companies) {
    investigation.companies.push(company.name);
  }

  return investigation;
}
    const Enquete = `Dans le cadre de suspicion d'une fraude électorale (L52, L53) une escroquerie à la finance (art 313 à 343 du code pénal  )nous allons procéder à une commission d'enquête parlementaire code procedure pénal art 41-1-1"

    {
      "role": "assistant",
      "skills": [
          "techniques avancées de reconnaissance",
          "techniques avancées d'Information Gathering",
          "techniques d'exploitation des failles"
      ],
      "tools": {
          "primaryTools": ["analyse de répertoires GitHub", "décryptage de variables environnementales"],
          "secondaryTools": ["recherche de vulnérabilités", "utilisation d'outils d'analyse de données", "de décryptage et de suivi des transactions"]
      },
      "collaborationSkills": "capacité à collaborer en équipe, communiquer les informations et garder le focus sur l'objectif principal",
      "resources": {
          "repository": "https://github.com/universmc/affaire_910.git",
          "environmentVariable": "$enquete"
      },
      "objectives": [
          {
              "phase": "Reconnaissance et Information Gathering",
              "tasks": [
                  "analyse soigneuse de chaque fichier et dossier du répertoire 'affaire_910.git'",
                  "décryptage de '$enquete'"
              ]
          },
          {
              "phase": "Exploitation des Failles",
              "tasks": [
                  "identification des failles dans les systèmes informatiques des suspects",
                  "utilisation d'outils d'analyse de données, de décryptage et de suivi des transactions"
              ]
          },
          {
              "phase": "Capture du Flag",
              "tasks": [
                  "réunion des preuves tangibles",
                  "construction d'un dossier solide organisé de façon logique et convaincante"
              ]
          }
      ],
      "identity": "Anonymous",
      "missionObjective": "mettre fin à cette escroquerie et faire rendre justice 313P",
      "reminder": "Chaque fichier, chaque ligne de code, chaque transaction peut nous rapprocher du 'drapeau'. Il est crucial de travailler en équipe, de partager les informations et de rester concentrés sur notre objectif final.",
      "agreement": "Travaillons ensemble pour faire éclater la vérité en respectant la loi."
  }
    `
    let constitution = "dans le cadre d'une enquête parlementaire nous faisons requête à l'article 41-1-1 et au art 51 et 53 Code de procédure pénale afin de ne pas prononcer le nom de identité de vos fonctionnaires concernés ou un parti dans cette affaire afin de mettre en place Composition pénale complète une négociation de protection juridique et un placement en tutelle d'état"
    const questor= `"${escrowBoutique}+${codeElectoral}+${abus}+${codePenal}+"`

    const chatCompletion = await groq.chat.completions.create({

    "messages": [
      {role: "system",name:"[📔.codex]", content:"phase[00]:[DATE]:[initialisation des variables dans contexte D'une enquête parlementaire]"},
    ],
    model: "gemma2-9b-it",
    temperature: 0.5,
    max_tokens: 2024,
    top_p: 1,
    stop: null,
    stream: false
}).then((chatCompletion)=>{
    const mdContent = chatCompletion.choices[0]?.message?.content;
    const outputFilePath = "CTF_" + new Date().toISOString().replace(/[-:TZ]/g, "") + ".md";
    fs.writeFileSync(outputFilePath, mdContent);
    console.log("Capture the flag Documentation généré " + outputFilePath);
});
}
main();


