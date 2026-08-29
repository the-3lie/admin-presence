'use client';

import { useState } from 'react';
import Link from 'next/link';

// NOTE : l'envoi d'email réel (lien de réinitialisation) doit être branché
// à un service comme Resend ou Nodemailer côté serveur. Ce formulaire est
// prêt côté UI ; ajoutez la Server Action d'envoi selon votre fournisseur.
export default function MotDePasseOubliePage() {
  const [envoye, setEnvoye] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper">
      <div className="w-full max-w-sm bg-white border border-[#DCD6C7] rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6">Mot de passe oublié</h1>

        {envoye ? (
          <p className="text-sm text-[#3F7D58]">
            Si un compte existe avec cette adresse, un lien de réinitialisation vient d'être envoyé.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEnvoye(true);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-[#5B6472] mb-1">Adresse email</label>
              <input type="email" required className="w-full border border-[#DCD6C7] rounded-lg px-3 py-2" />
            </div>
            <button className="w-full bg-ink text-paper rounded-lg py-2.5 font-semibold">
              Envoyer le lien
            </button>
          </form>
        )}

        <Link href="/login" className="block mt-4 text-sm text-[#5B6472] hover:text-ink">
          ← Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
