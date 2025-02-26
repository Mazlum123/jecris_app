import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Charge les variables du fichier .env

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: `"Test Jecris" <${process.env.EMAIL_USER}>`,
  to: "adresse.email@gmail.com",
  subject: "Test d'envoi Nodemailer",
  text: "Ceci est un email de test envoyé via Nodemailer",
};

transporter.verify((error, success) => {
  if (error) {
    console.error("Erreur de connexion SMTP :", error);
  } else {
    console.log("Connexion SMTP réussie !");
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return console.error("Erreur lors de l'envoi :", err);
      }
      console.log("Email envoyé avec succès :", info.response);
    });
  }
});

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
