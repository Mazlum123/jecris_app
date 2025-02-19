import nodemailer from "nodemailer";

export const sendPasswordSetupEmail = async (userEmail: string, token: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

        // Vérifie la connexion au serveur SMTP
        transporter.verify((error, success) => {
          if (error) {
            console.error("Erreur de connexion SMTP:", error);
          } else {
            console.log("Connexion SMTP réussie !");
          }
        });

    const mailOptions = {
      from: '"Jecris" <noreply@jecris.com>',
      to: userEmail,
      subject: "Définir votre mot de passe - Jecris",
      html: `
        <h1>Bienvenue sur Jecris !</h1>
        <p>Votre compte a été créé avec succès via Google.</p>
        <p>Veuillez définir un mot de passe pour accéder pleinement au site :</p>
        <a href="${process.env.CLIENT_URL}/set-password?token=${token}">Définir mon mot de passe</a>
        <p>Si vous n'êtes pas à l'origine de cette action, ignorez simplement cet e-mail.</p>
      `,
    };

    // Envoi de l'email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès:", info.response);

  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email :", error);
  }
};