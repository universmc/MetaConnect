const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const https = require("https"); // Gérer les requêtes HTTPS
const Groq = require("groq-sdk");
const groq = new Groq();

// Agent HTTPS sans vérification SSL
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const url = "https://boutique.elysee.fr";

// Charger les données JSON et le manifest
const pricePolicyData = JSON.parse(fs.readFileSync("politique_du_prix.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));

// Fonction pour extraire les informations des produits de la boutique
async function extractProductData(url) {
    try {
        const response = await axios.get(url, { httpsAgent });
        const $ = cheerio.load(response.data);
        let productData = [];

        $('.product-item').each((index, element) => {
            const productName = $(element).find('.product-item-name').text().trim();
            const productPrice = $(element).find('.product-item-price').text().trim();
            const productDescription = $(element).find('.product-item-description').text().trim();

            productData.push({
                name: productName || "Nom non disponible",
                price: productPrice || "Prix non disponible",
                description: productDescription || "Description non disponible",
                tva: extractTVA(productDescription)
            });
        });

        return productData;
    } catch (error) {
        console.error("Erreur lors de l'extraction des informations des produits :", error);
        return [];
    }
}

// Fonction pour extraire la TVA
function extractTVA(description) {
    const tvaMatch = description.match(/tva\s*(\d{1,2})%/i);
    return tvaMatch ? `${tvaMatch[1]}%` : "TVA non mentionnée";
}

// Modèle de question pour les témoins
function generateInvestigationQuestion(question, options) {
    return {
      question: question,
      options: options,
      answer_prompt: "Veuillez choisir une option pour continuer l'enquête."
    };
  }
  

// Fonction d'analyse de conformité des marges
function analyzeMargins(productData) {
    return productData.map(product => {
        const price = parseFloat(product.price.replace(/[^\d.-]/g, ''));
        const margin = price ? (price * 0.2).toFixed(2) : "Marge non calculable";
        return { ...product, calculatedMargin: margin };
    });
}

// Génération de documentation détaillée
function generateDocumentation(questions, manifest, productData, analyzedData) {
    const content = `
# Documentation d'enquête : Boutique Elysee.fr

## Objectifs de l'enquête
${manifest.objectifs ? manifest.objectifs.join("\n") : "Objectifs non définis."}

## Références légales
${manifest.legal_references ? manifest.legal_references.map(ref => `${ref.code}, Articles : ${ref.articles.join(", ")}, Description : ${ref.description}`).join("\n") : "Références légales non définies."}

## Questions et options
${questions.map(q => `### Question : ${q.question}\nOptions : ${q.options.join(", ")}\n`).join("\n")}

## Données des produits extraites
${productData.map(p => `- **Produit** : ${p.name}\n  - **Prix** : ${p.price}\n  - **Description** : ${p.description}\n  - **TVA** : ${p.tva}`).join("\n\n")}

## Analyse des marges et de conformité
${analyzedData.map(p => `- **Produit** : ${p.name}\n  - **Prix** : ${p.price}\n  - **Marge calculée** : ${p.calculatedMargin}`).join("\n\n")}

## Détails supplémentaires
- Date de génération : ${new Date().toLocaleString()}
`;

    const outputFilePath = `Documentation_Investigation_${new Date().toISOString().replace(/[-:TZ]/g, "")}.md`;
    fs.writeFileSync(outputFilePath, content);
    console.log("Documentation d'investigation sauvegardée dans " + outputFilePath);
}

// Fonction principale
async function main() {
    const productData = await extractProductData(url);
    const analyzedData = analyzeMargins(productData);

    const investigationQuestions = [
        generateInvestigationQuestion("Quels produits de la boutique sont associés à des marges élevées ?", productData.map(p => p.name)),
        generateInvestigationQuestion("Quel est le pourcentage de TVA appliqué ?", ["5.5%", "10%", "20%", "Non spécifié"]),
        generateInvestigationQuestion("Les entités politiques sont-elles impliquées ?", pricePolicyData.investigation.entites_politique.liste_entites)
    ];

    // Interagir avec l'IA pour générer un rapport complet de l'enquête
    const completion = await groq.chat.completions.create({
        messages: [
            { role: "assistant", content: "Phase d'enquête : analyse des flux financiers sur boutique.elysee.fr." },
            { role: "system", content: JSON.stringify(manifest) },
            { role: "user", name: "investigateur", content: "Analyse des marges et des prix des articles vendus par les hauts fonctionnaires." }
        ],
        model: "llama3-8b-8192",
        temperature: 0.7,
        max_tokens: 4096,
    }).then((chatCompletion) => {
        const mdContent = chatCompletion.choices[0]?.message?.content;
        const outputFilePath = "Investigation_Report_" + new Date().toISOString().replace(/[-:TZ]/g, "") + ".md";
        fs.writeFileSync(outputFilePath, mdContent);
        console.log("Rapport d'investigation généré et enregistré dans " + outputFilePath);
    });

    generateDocumentation(investigationQuestions, manifest, productData, analyzedData);
}

main().catch(console.error);
