// Messages publics volontairement non révélateurs d'existence d'un compte.
export function authMessage(error, context='login'){
 const code=String(error?.code||'').toLowerCase();
 const message=String(error?.message||'').toLowerCase();
 if(code==='email_not_confirmed'||message.includes('email not confirmed'))return "Ton adresse e-mail n'est pas encore confirmée. Vérifie tes messages et tes spams, puis utilise le lien reçu.";
 if(['user_already_exists','email_exists'].includes(code)||message.includes('already registered')||message.includes('already exists'))return "Cette adresse semble déjà associée à un compte. Essaie de te connecter ou de réinitialiser ton mot de passe.";
 if(code==='weak_password'||message.includes('password should be')||message.includes('password is too short'))return "Ce mot de passe est trop faible. Choisis un mot de passe plus long, avec au moins 8 caractères.";
 if(code==='email_address_invalid'||code==='validation_failed'&&message.includes('email')||message.includes('unable to validate email address'))return "Cette adresse e-mail ne semble pas valide. Vérifie son orthographe.";
 if(code==='signup_disabled'||code==='email_provider_disabled')return "La création de comptes est temporairement indisponible. Réessaie plus tard.";
 if(code==='over_email_send_rate_limit'||code==='over_request_rate_limit'||code==='rate_limit_exceeded'||error?.status===429)return "Trop de tentatives en peu de temps. Patiente quelques minutes avant de réessayer.";
 if(code==='otp_expired'||code==='otp_disabled'||message.includes('expired'))return "Ce lien a expiré. Demande un nouveau message de confirmation ou de récupération.";
 if(code==='same_password'||message.includes('same password'))return "Choisis un mot de passe différent de l'ancien.";
 if(code==='invalid_credentials'||code==='invalid_login_credentials'||message.includes('invalid login credentials')||message.includes('invalid credentials'))return "Impossible de te connecter avec cet e-mail et ce mot de passe. Vérifie tes informations. Si tu n'as pas encore de compte, crée-en un.";
 if(code==='email_address_not_authorized')return "L'envoi d'e-mails à cette adresse n'est pas autorisé pour le moment. Contacte l'assistance CAMPUS.";
 if(message.includes('network')||message.includes('fetch failed'))return "Connexion impossible. Vérifie ta connexion Internet et réessaie.";
 if(context==='signup')return "L'inscription n'a pas pu aboutir. Vérifie les informations saisies et réessaie.";
 if(context==='forgot')return "Le lien n'a pas pu être envoyé. Réessaie plus tard ou contacte l'assistance CAMPUS.";
 if(context==='recovery')return "Le mot de passe n'a pas pu être modifié. Redemande un lien de récupération si nécessaire.";
 return "La connexion a échoué. Vérifie ton e-mail et ton mot de passe, ou crée un compte si tu n'en as pas encore.";
}
