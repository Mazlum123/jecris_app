import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  // States pour les champs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // States pour les erreurs
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  // Autres states
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Vérification de l'email en temps réel
  const checkEmail = async (email: string) => {
    if (!email) {
      setEmailError("L'email est requis.");
      setIsEmailValid(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Format d'email invalide.");
      setIsEmailValid(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEmailError(data.error || "Erreur lors de la vérification de l'email.");
        setIsEmailValid(false);
      } else if (!data.exists) {
        setEmailError("L'email n'est pas valide.");
        setIsEmailValid(false);
      } else if (!data.available) {
        setEmailError("Cet email est déjà utilisé.");
        setIsEmailValid(false);
      } else {
        setEmailError(null);
        setIsEmailValid(true);
      }
    } catch (_) {
      setEmailError("Erreur réseau lors de la vérification.");
      setIsEmailValid(false);
    }
  };

  // Déclenche la vérification de l'email après un délai
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (email) {
        checkEmail(email);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [email]);

  // Vérifie la force du mot de passe
  useEffect(() => {
    const calculatePasswordStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[\W]/.test(password)) strength += 1;
      return strength;
    };

    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);

    if (password && strength < 3) {
      setPasswordError("Mot de passe trop faible.");
    } else {
      setPasswordError(null);
    }
  }, [password]);

  // Vérifie la correspondance des mots de passe
  useEffect(() => {
    if (confirmPassword && confirmPassword !== password) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas.");
    } else {
      setConfirmPasswordError(null);
    }
  }, [password, confirmPassword]);

  // Gestion de l'envoi du formulaire
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailValid || passwordStrength < 3 || confirmPassword !== password) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        alert("Compte créé avec succès !");
        navigate("/login");
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'inscription.");
      }
    } catch (_) {
      alert("Erreur réseau lors de l'inscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour afficher la force du mot de passe
  const renderPasswordStrength = () => {
    const strengthLabels = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];
    const colors = ["#ff4d4f", "#ff7a45", "#ffa940", "#73d13d", "#52c41a"];

    return (
      <div className="password-strength">
        <div
          className="strength-bar"
          style={{
            width: `${(passwordStrength / 5) * 100}%`,
            backgroundColor: colors[passwordStrength - 1] || "#ccc",
          }}
        ></div>
        <p>{password ? strengthLabels[passwordStrength - 1] || "Trop court" : ""}</p>
      </div>
    );
  };

  return (
    <div className="register-page">
      <h1>Inscription</h1>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {emailError && <p className="error">{emailError}</p>}
        {isEmailValid && <p className="success">✅ Email valide et disponible.</p>}

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {renderPasswordStrength()}
        {passwordError && <p className="error">{passwordError}</p>}

        <input
          type="password"
          placeholder="Confirmez le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {confirmPasswordError && <p className="error">{confirmPasswordError}</p>}

        <button type="submit" disabled={!isEmailValid || passwordStrength < 3 || isSubmitting}>
          {isSubmitting ? "Inscription..." : "S'inscrire"}
        </button>
      </form>

      <div className="or-separator">ou</div>

      <button className="google-btn" onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`}>
        <img src="/google-icon.png" alt="Google Icon" />
        Inscrivez-vous avec Google
      </button>
    </div>
  );
};

export default Register;