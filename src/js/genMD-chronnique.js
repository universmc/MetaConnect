const fs = require("fs");
const Groq = require("groq-sdk");
const groq = new Groq();

const projects = ["Chronique"];

const modelConfig = {
  model: "gemma2-9b-it",
  temperature: 0.5,
  max_tokens: 4096,
};

// Charger le fichier JSON de la chronique
function loadChroniqueContent() {
  const rawData = fs.readFileSync("chronique.json");
  return JSON.parse(rawData);
}

// Fonction de génération de Markdown pour chaque projet en utilisant les données JSON
function generateMarkdown(project, content) {
  let markdown = `## Guide Complet pour [${project}]\n\n`;
  markdown += `### Introduction\n\n${content.introduction}\n\n`;
  
  for (const [sectionKey, section] of Object.entries(content.sections)) {
    markdown += `### ${section.title}\n\n${section.content}\n\n`;
  }

  markdown += `### Conclusion\n\n${content.conclusion}`;
  return markdown;
}

// Fonction principale de génération des guides pour chaque projet
async function main() {
  const chroniqueContent = loadChroniqueContent();

  for (const project of projects) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "Assistant IA pour la création de guides." },
          { role: "user", content: generateMarkdown(project, chroniqueContent) },
        ],
        ...modelConfig,
      });

      const mdContent = completion.choices[0]?.message?.content;
      const outputFilePath = `Chonique_${project}_${new Date()
        .toISOString()
        .replace(/[-:TZ]/g, "")}.md`;

      fs.writeFileSync(outputFilePath, mdContent);
      console.log(`Le How-To sur ${project} a été enregistré dans ${outputFilePath}`);
    } catch (error) {
      console.error(`Erreur avec ${project} :`, error.message);
    }
  }
}

main();
