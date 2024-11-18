const axios = require("axios");
const fs = require("fs");

// Charger le fichier des sources
const sources = JSON.parse(fs.readFileSync("sources.json", "utf8")).sources;

// Fonction de recherche avec des mots-clés et sources spécifiques
async function rechercheMultiSource(motsCles) {
    const resultats = [];

    for (const source of sources) {
        if (source.active) {
            try {
                let url = source.url;
                let params = { ...source.parametres };

                // Injecter les mots-clés dans les paramètres de recherche
                for (const param in params) {
                    if (params[param] === "") params[param] = motsCles;
                }

                // Configurer l'en-tête pour certaines API comme Twitter ou Facebook
                const options = {};
                if (params.bearer_token) {
                    options.headers = { Authorization: `Bearer ${params.bearer_token}` };
                    delete params.bearer_token;
                }

                const response = await axios.get(url, { params, ...options });
                resultats.push({ source: source.nom, data: response.data });
            } catch (error) {
                console.error(`Erreur lors de la recherche sur ${source.nom} :`, error.message);
            }
        }
    }
    return resultats;
}

function extraireInformations(resultats, motsCles) {
    return resultats.map(resultat => {
        const contenu = resultat.data;
        // Appliquer des filtres spécifiques pour chaque source, par exemple pour Google, Twitter, etc.
        if (resultat.source === "Google") {
            return contenu.items ? contenu.items.map(item => item.snippet).join("\n") : "Aucun résultat pertinent.";
        } else if (resultat.source === "Archive.org") {
            return contenu.response ? contenu.response.docs.map(doc => doc.title).join("\n") : "Aucun document trouvé.";
        }
        // Autres filtres pour d’autres sources ici
    });
}

// Appeler la fonction pour extraire des informations
(async () => {
    const motsCles = "Sanofi délocalisation santé publique";
    const resultats = await rechercheMultiSource(motsCles);
    const extraits = extraireInformations(resultats, motsCles);

    extraits.forEach((extrait, index) => {
        console.log(`Résumé pour ${resultats[index].source} :\n${extrait}`);
    });
})();
