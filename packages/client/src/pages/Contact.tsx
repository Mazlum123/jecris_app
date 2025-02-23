import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import "../styles/pages/_contact.scss";

const Contact = () => {
  const form = useRef<HTMLFormElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    if (!form.current) return;

    emailjs
      .sendForm(
        "service_fwcxhhz",
        "template_jys72ep",
        form.current,
        "uY1c94Iu0OSNhe4mc"
      )
      .then(
        (result) => {
          console.log(result.text);
          setStatusMessage("✅ Message envoyé avec succès !");
          form.current?.reset();
        },
        (error) => {
          console.error(error.text);
          setStatusMessage("❌ Erreur lors de l'envoi du message. Veuillez réessayer.");
        }
      )
      .finally(() => setIsSending(false));
  };

  return (
    <div className="contact-container">
      <h1>📬 Contactez-nous</h1>

      {/* 💡 Affichage de ton email */}
      <p>Pour toute question, vous pouvez également nous écrire directement à : <strong>mazlum.morcicek.dev@gmail.com</strong></p>

      <form ref={form} onSubmit={sendEmail} className="contact-form">
        <label>Nom *</label>
        <input type="text" name="user_name" required />

        <label>Email *</label>
        <input type="email" name="user_email" required />

        <label>Sujet *</label>
        <input type="text" name="subject" required />

        <label>Message *</label>
        <textarea name="message" rows={5} required></textarea>

        <button type="submit" disabled={isSending} className="btn-primary">
          {isSending ? "Envoi en cours..." : "Envoyer"}
        </button>

        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </form>

      <div className="coming-soon">
        <h2>🚀 Prochainement sur le site :</h2>
        <ul>
          <li>📖 Mode écriture</li>
          <li>📖 Mode lecture nocturne</li>
          <li>💬 Système de commentaires sur les livres</li>
          <li>🏆 Classement des meilleurs livres</li>
        </ul>
      </div>
    </div>
  );
};

export default Contact;
