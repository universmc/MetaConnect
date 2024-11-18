const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

// URLs des vidéos YouTube à évaluer
const VIDEOS = [
    'https://www.youtube.com/watch?v=VID1',
    'https://www.youtube.com/watch?v=VID2'
    // Ajoutez d'autres URLs si nécessaire
];

// Heure de début de la présentation (10:00)
const startHour = new Date();
startHour.setHours(10, 0, 0, 0);

// Fonction pour attendre jusqu'à 10h
const waitUntilStart = async () => {
    const currentTime = Date.now();
    if (currentTime < startHour.getTime()) {
        console.log("⏱️ En attente jusqu'à 10h pour commencer...");
        await new Promise(resolve => setTimeout(resolve, startHour.getTime() - currentTime));
    }
    console.log("⏱️ Le CTF a commencé! Vous avez jusqu'à 18h pour participer.");
};

// Date limite du CTF (1 novembre 2024)
const CTF_DEADLINE = new Date('2024-11-01T00:00:00Z').getTime();

// Vérifie si le téléchargement et l'évaluation des vidéos peuvent commencer
const evaluateVideos = async () => {
    for (const videoUrl of VIDEOS) {
        // Vérifiez si la date limite est passée
        const currentTime = Date.now();
        if (currentTime > CTF_DEADLINE) {
            console.log("⌛️ La date limite du CTF est passée. L'évaluation est terminée.");
            return;
        }

        const videoId = videoUrl.split('v=')[1];
        const outputPath = `${videoId}.mp4`;

        // Téléchargez la vidéo
        console.log(`Téléchargement de la vidéo: ${videoUrl}`);
        await new Promise((resolve, reject) => {
            const downloadStream = ytdl(videoUrl);
            downloadStream.pipe(fs.createWriteStream(outputPath));
            downloadStream.on('end', resolve);
            downloadStream.on('error', reject);
        });

        // Vérifiez la durée de la vidéo
        await new Promise((resolve, reject) => {
            ffmpeg.ffprobe(outputPath, (err, metadata) => {
                if (err) {
                    reject(err);
                    return;
                }
                const duration = metadata.format.duration;
                if (Math.round(duration) !== 68) {
                    console.log(`La vidéo '${videoUrl}' a une durée incorrecte (${Math.round(duration)}s, dû être 68s).`);
                } else {
                    console.log(`La vidéo '${videoUrl}' a une durée correcte de 68s.`);
                }
                resolve();
            });
        });

        // Supprimez le fichier après évaluation
        fs.unlinkSync(outputPath);
    }
};

// Fonction principale
const main = async () => {
    await waitUntilStart();
    await evaluateVideos();
};

main().catch(error => {
    console.error("Une erreur s'est produite :", error);
});
