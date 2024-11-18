const fs = require("fs");
const Groq = require("groq-sdk");
const groq = new Groq();

// Paramètres pour les sessions du CTF
const WORK_TIME = 25 * 60 * 1000; // 25 minutes pour une session de travail
const SHORT_BREAK_TIME = 5 * 60 * 1000; // 5 minutes pour une pause courte
const LONG_BREAK_TIME = 15 * 60 * 1000; // 15 minutes pour une pause longue
let ctfSessionCount = 0; // Compteur pour les sessions de CTF

// Liste des tâches pour le CTF avec objectifs et appel à l'action
const tasks = [
  {
    id: 1,
    title: "Définir les objectifs du CTF",
    description: `
      Déterminer les objectifs principaux du CTF en lien avec la dénonciation des manipulations électorales et des abus financiers.
      - Objectif : Développer un environnement de défi incitant à l’analyse critique et à la détection des mécanismes de fraude.
      - Appel à l'action : Inviter les participants à se pencher sur des cas concrets de fraude, de propagande et d'abus en utilisant des outils de détection d'anomalies et d'investigation numérique.
      - Détails : Offrir une récompense de 500 Pi_coins.ico pour les gagnants. Préparer des scénarios de cas pour illustrer les situations réelles de fraude électorale et d'escroquerie.
    `,
    completed: false
  },
  {
    id: 2,
    title: "Création de la Chronique Politique",
    description: `
      Élaborer la chronique politique "Chronique Anti Macroniste" pour sensibiliser sur la désinformation et l’influence de la propagande par les milliardaires.
      - Objectif : Informer les participants sur les effets de la propagande dans le processus électoral, illustrant la désinformation et l’influence exercée par des groupes financiers puissants.
      - Appel à l'action : Mobiliser l’opinion publique en éduquant sur les méthodes de manipulation et de désinformation via des scénarios interactifs et des études de cas.
      - Détails : Inclure des sections sur la fraude électorale, la manipulation financière et la répression de l’opposition, présentées dans une vidéo de 68 secondes pour une diffusion accessible et percutante.
    `,
    completed: false
  },
  {
    id: 3,
    title: "Organisation et Documentation du Manifeste",
    description: `
      Structurer le manifeste autour des problématiques soulevées : fraude électorale, escroquerie financière et désinformation orchestrée.
      - Objectif : Délivrer un manifeste documenté qui présente les problématiques de manière juridique en se basant sur les textes de loi en vigueur.
      - Appel à l'action : Engager les participants à revendiquer la transparence dans les processus électoraux et financiers en utilisant des références légales solides.
      - Détails : Référencer les articles du code pénal et du code électoral (L52, L53 pour la fraude, 313-342 pour l’escroquerie) pour renforcer l’argumentaire et structurer un appel à l’action citoyen.
    `,
    completed: false
  }
];

// Contenu de la chronique pour les discussions autour des preuves du CTF
const chronique = `
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
`;

// Fonction principale pour interagir avec l'IA et générer les éléments de preuve du CTF
async function main() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "assistant", content: `${tasks}+${chronique}` },
        {
          role: "system",
          content: "Rédiger un plan de développement pour la présentation des preuves de CTF en fonction des objectifs du manifeste et des lois en vigueur."
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.6,
      max_tokens: 2048,
      top_p: 1,
      stream: false
    });

    const mdContent = chatCompletion.choices[0]?.message?.content;
    const outputFilePath = "CTF_" + new Date().toISOString().replace(/[-:TZ]/g, "") + ".md";
    fs.writeFileSync(outputFilePath, mdContent);
    console.log("Documentation générée et enregistrée dans " + outputFilePath);

    // Début de la session du CTF
    startCTF();
  } catch (error) {
    console.error("Erreur lors de la génération de la documentation :", error);
  }
}

// Fonction pour démarrer une session de CTF
function startCTF() {
  console.log(`🔧 Tâche actuelle : ${tasks[ctfSessionCount % tasks.length].title}`);
  console.log("⏳ Début de la session de travail de 25 minutes.");
  
  setTimeout(() => {
    ctfSessionCount += 1;
    console.log("✅ Fin de la session de travail. Prenez une pause de 5 minutes.");

    // Gestion des pauses longues après 4 sessions
    if (ctfSessionCount % 4 === 0) {
      console.log("💡 Prendre une longue pause de 15 minutes.");
      setTimeout(startCTF, LONG_BREAK_TIME); // Pause longue
    } else {
      setTimeout(startCTF, SHORT_BREAK_TIME); // Pause courte
    }
  }, WORK_TIME);
}

// Exécution de la fonction principale
main().catch(console.error);
