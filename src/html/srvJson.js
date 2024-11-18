const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); // Assurez-vous d'installer Nodemailer avec `npm install nodemailer`
const app = express();

app.use(bodyParser.json());

app.post('/api/submit', async (req, res) => {
    const { name, email } = req.body;

    try {
        // Configuration du transporteur SMTP pour envoyer un e-mail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'hubmaster74@gmail.com',
                pass: 'google@mK2442cm' // Remplacez par un mot de passe d'application sécurisé
            }
        });

        // Détails de l'e-mail à envoyer
        const mailOptions = {
            from: 'hubmaster74@gmail.com',
            to: 'hubmaster74@gmail.com',
            subject: `Nouvelle Participation CTF - ${name}`,
            text: `Nom : ${name}\nE-mail : ${email}`
        };

        // Envoi de l'e-mail
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Données soumises avec succès, e-mail envoyé.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la soumission des données.' });
    }
});

app.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
