const fs = require("fs");
const Groq = require("groq-sdk");
const groq = new Groq();

// Charger le fichier JSON de la politique du prix
const pricePolicyData = JSON.parse(fs.readFileSync('politique_du_prix.json', 'utf8'));


const manifest = `
{
    "title": "La Démocratie en Danger : Manifeste pour la Transparence et l'Intégrité",
    "description": "Ce manifeste vise à sensibiliser et mobiliser les citoyens contre la fraude électorale, l'escroquerie financière en bande organisée, et la désinformation orchestrée par certains groupes de pouvoir, afin de défendre notre démocratie et promouvoir un système juste et transparent.",
    "introduction": {
      "content": "La démocratie, telle que nous la connaissons, est aujourd'hui menacée par une série de pratiques qui sapent ses fondements. Fraude électorale, escroquerie financière en bande organisée, et propagande orchestrée par de puissants groupes influents sont autant de dangers qui privent les citoyens de leur droit à une information transparente et à un système de gouvernance honnête. Ce manifeste a pour but de dénoncer ces pratiques et d’appeler à une mobilisation pour défendre l'intégrité de notre démocratie.",
      "appel_a_action": "Citoyens, engageons-nous pour une démocratie véritable et transparente, libre des manipulations et des influences indésirables !"
    },
    "sections": [
      {
        "title": "Fraude électorale : Une atteinte à la volonté du peuple",
        "content": "La fraude électorale sape directement la volonté des citoyens en faussant les résultats électoraux. Ces pratiques peuvent inclure la manipulation des bulletins, l'usage de listes électorales frauduleuses, et l'influence financière indue. Elles constituent une violation flagrante de la démocratie.",
        "details": [
          "Manipulations lors du comptage des votes, entraînant des résultats qui ne reflètent pas la réalité.",
          "Inscriptions et suppressions frauduleuses de noms sur les listes électorales pour influencer le résultat.",
          "Usage de moyens financiers massifs pour corrompre les campagnes et s'assurer du contrôle des institutions."
        ],
        "legal_references": [
          {
            "code": "Code électoral",
            "articles": ["L52", "L53"],
            "description": "Ces articles répriment les actes de fraude électorale et l'usage abusif de propagande."
          }
        ],
        "appel_a_action": "Exigeons des audits et des contrôles indépendants pour garantir des élections transparentes."
      },
      {
        "title": "Escroquerie financière en bande organisée",
        "content": "L'escroquerie financière en bande organisée représente une menace sérieuse pour l'économie et la confiance des citoyens. En concentrant le pouvoir financier et en exploitant des mécanismes illégaux pour détourner des fonds, certaines entités mettent en péril l'intégrité du système financier et renforcent les inégalités.",
        "details": [
          "Pratiques d'escroquerie financière impliquant des réseaux d'influence pour détourner les fonds publics et privés.",
          "Corruption généralisée au sein de certains secteurs pour favoriser des intérêts particuliers au détriment de l'intérêt public.",
          "Manipulation de la justice pour protéger les fraudeurs et garantir leur impunité."
        ],
        "legal_references": [
          {
            "code": "Code pénal",
            "articles": ["313", "314", "340", "342"],
            "description": "Ces articles criminalisent l'escroquerie, l'abus de confiance, et la corruption en bande organisée dans les finances publiques et privées."
          }
        ],
        "appel_a_action": "Demandons la transparence et une législation stricte contre l'escroquerie financière en bande organisée."
      },
      {
        "title": "Désinformation et propagande des milliardaires",
        "content": "La désinformation orchestrée par des élites économiques manipule l'opinion publique en faussant les faits et en créant une propagande favorable à leurs intérêts. Les réseaux sociaux et médias dominés par ces groupes diffusent des messages biaisés, créant des perceptions erronées et polarisant la société.",
        "details": [
          "Utilisation de fausses informations pour orienter l'opinion publique et discréditer les opposants politiques.",
          "Contrôle des médias pour propager des messages en faveur des intérêts économiques de l'élite.",
          "Utilisation de réseaux sociaux et d'algorithmes pour renforcer la visibilité de contenus propagandistes et filtrer les opinions dissidentes."
        ],
        "legal_references": [
          {
            "code": "Code pénal",
            "articles": ["431", "226"],
            "description": "Législation contre la manipulation de l'opinion publique et le non-respect du consentement et de la transparence dans la diffusion d'informations."
          }
        ],
        "appel_a_action": "Réclamons la liberté et la diversité dans les médias pour garantir une information équilibrée."
      }
    ],
    "conclusion": {
      "content": "Face à ces menaces, il est impératif de se mobiliser pour défendre la démocratie, la transparence et l'égalité. Nous devons agir pour garantir que notre système électoral et financier soit exempt de manipulations et que chaque citoyen ait accès à une information impartiale et véridique.",
      "appel_a_action_global": "Ensemble, exigeons des réformes qui protègent nos droits et préservent l'intégrité de notre démocratie."
    },
    "additional_notes": [
      "En tant que citoyens engagés, nous appelons à la création d'une commission d'enquête parlementaire pour approfondir les allégations de fraude électorale et d'escroquerie financière.",
      "Conformément à l'article 41 du code de procédure pénale et à l'article 211 du code de la sécurité intérieure, nous exerçons notre droit à organiser une manifestation pacifique pour exprimer notre volonté de réformer notre système."
    ]
  }
`


// Fonction pour générer une réponse basée sur la politique du prix
function templateResponse(question, options, consequences, nextQuestions, causes, effects) {
  return {
    response: {
      question: question,
      answer: {
        text: "Les possibilités sont multiples.",
        quick_replies: options
      },
      decision_tree: options.reduce((acc, option, index) => {
        acc[`Option ${index + 1}`] = {
          consequences: consequences[index],
          next_questions: nextQuestions[index],
          causes: causes[index],
          effects: effects[index]
        };
        return acc;
      }, {})
    }
  };
}

// Exemple d'utilisation des données du fichier JSON dans le script
async function main() {
  const question = "Quelle est la meilleure façon de procéder pour enquêter sur la politique du prix ?";
  const options = [
    "Analyser les coûts liés aux transports publics",
    "Examiner les marges pratiquées sur les produits",
    "Suivre les flux financiers des entités politiques"
  ];
  
  // Utilisation des données JSON dans les conséquences et causes
  const consequences = [
    pricePolicyData.investigation.entites_politique.enquete.prix_transports_publics.description,
    pricePolicyData.investigation.prix_produits.analyse.enjeux,
    pricePolicyData.investigation.etapes_investigation.identification_beneficiaires.description
  ];

  const nextQuestions = [
    ["Quels sont les bénéfices non déclarés des entités politiques ?", "Comment les marges des produits influencent-elles les finances publiques ?"],
    ["Quels produits sont particulièrement concernés ?", "Les preuves trouvées sont-elles suffisantes pour soutenir les accusations ?"],
    ["Qui sont les bénéficiaires réels des bénéfices de la vente de produits publics ?"]
  ];

  const causes = [
    "Les coûts de transport ont un impact direct sur la gestion des finances publiques.",
    "Les marges sur les produits peuvent cacher des détournements de fonds publics.",
    "Les flux financiers doivent être surveillés pour identifier les bénéficiaires non déclarés."
  ];

  const effects = [
    ["Vous découvrez des irrégularités dans les bénéfices des entités politiques", "Le transport public pourrait subir des hausses injustifiées"],
    ["Les preuves sont recueillies sur les produits vendus via des entités comme Elysee X", "Vous avancez dans la compréhension des flux financiers"],
    ["Vous identifiez des bénéficiaires non déclarés et des malversations potentielles", "Vous pourriez exposer de graves fraudes financières"]
  ];

  // Créer une réponse avec les données JSON
  const response = templateResponse(question, options, consequences, nextQuestions, causes, effects);
  console.log(response);

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "assistant", content: "Phase 1: Initialisation de l'enquête sur la politique du prix" },
      { role: "system", content: `${manifest}` },
      {
        role: "system",
        content: "Utilisation des données de la politique du prix pour structurer les questions et options"
      },
      { role: "user", name: "umcTokens", content: "Début de l'analyse sur les flux financiers et les entités politiques" }
    ],
    model: "gemma2-9b-it",
    temperature: 0.7,
    max_tokens: 4096,
  }).then((chatCompletion) => {
    const mdContent = chatCompletion.choices[0]?.message?.content;
    const outputFilePath = "Documentation" + new Date().toISOString().replace(/[-:TZ]/g, "") + ".md";
    fs.writeFileSync(outputFilePath, mdContent);
    console.log("Documentation générée et enregistrée dans " + outputFilePath);
  });
}

main();
