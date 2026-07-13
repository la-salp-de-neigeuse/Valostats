export const LEGAL_CONTACT = {
  company: "ValoStats",
  email: "valostatsapp@gmail.com",
  privacyEmail: "valostatsapp@gmail.com",
  publicationDirector: "Lezox",
  host: {
    name: "Vercel Inc.",
    address: "340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis",
  },
  lastUpdate: "12 juillet 2026",
} as const;

export const MENTIONS_LEGALES_SECTIONS = [
  {
    id: "editeur",
    title: "Responsable de publication",
    content: `ValoStats est un service SaaS édité par une société inscrite au registre du commerce.`,
    details: [
      { label: "Responsable de publication", value: LEGAL_CONTACT.publicationDirector },
      { label: "Contact", value: LEGAL_CONTACT.email },
    ],
  },
  {
    id: "hebergeur",
    title: "Hébergeur",
    content: null,
    details: [
      { label: "Nom", value: LEGAL_CONTACT.host.name },
      { label: "Adresse", value: LEGAL_CONTACT.host.address },
    ],
  },
  {
    id: "propriete-intellectuelle",
    title: "Propriété intellectuelle",
    content: [
      "ValoStats n'est pas affilié à Riot Games, Inc. VALORANT est une marque déposée de Riot Games, Inc.",
      "Les données affichées proviennent de l'API publique Riot Games et sont utilisées conformément à leur politique de développement.",
      "L'ensemble du code, du design et du contenu de ValoStats est protégé par le droit d'auteur. Toute reproduction sans autorisation est interdite.",
    ],
    details: [],
  },
  {
    id: "cookies",
    title: "Cookies",
    content: [
      "ValoStats utilise des cookies techniques strictement nécessaires au fonctionnement de l'authentification (session JWT) et à la sécurité du service.",
      "Aucun cookie publicitaire ou de tracking tiers n'est utilisé.",
    ],
    details: [],
  },
] as const;

export const PRIVACY_SECTIONS = [
  {
    id: "donnees-collectees",
    title: "Données collectées",
    content: [
      "Nous collectons uniquement les données nécessaires au fonctionnement du service :",
    ],
    items: [
      "Adresse email — pour la création et la gestion de votre compte",
      "Pseudonyme — pour l'affichage de votre profil",
      "Statistiques de jeu Valorant — récupérées via l'API publique Riot Games",
      "Informations de paiement — traitées via Stripe, nous ne stockons aucune donnée bancaire",
    ],
    details: [],
  },
  {
    id: "cookies",
    title: "Cookies",
    content: [
      "ValoStats utilise des cookies techniques strictement nécessaires au fonctionnement de l'authentification (session JWT) et à la sécurité du service.",
      "Aucun cookie publicitaire ou de tracking tiers n'est utilisé.",
      "Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités du service pourraient ne plus fonctionner.",
    ],
    details: [],
  },
  {
    id: "partage-donnees",
    title: "Partage des données",
    content: [
      "Vos données ne sont jamais revendues à des tiers. Elles sont partagées uniquement avec nos sous-traitants techniques dans le strict nécessaire à leur prestation :",
    ],
    items: [
      "Vercel — hébergement de l'application",
      "Supabase — hébergement de la base de données PostgreSQL",
      "Stripe — traitement des paiements",
    ],
    details: [],
  },
  {
    id: "vos-droits",
    title: "Vos droits (RGPD)",
    content: [
      "Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :",
    ],
    items: [
      "Droit d'accès — obtenir une copie de vos données personnelles",
      "Droit de rectification — modifier vos données personnelles",
      "Droit à l'effacement — supprimer votre compte et vos données",
      "Droit à la limitation du traitement — restreindre l'utilisation de vos données",
      "Droit d'opposition — vous opposer au traitement de vos données",
      "Droit à la portabilité — récupérer vos données dans un format structuré",
    ],
    details: [
      { label: "Email de contact", value: LEGAL_CONTACT.privacyEmail },
    ],
  },
] as const;

export const CGU_SECTIONS = [
  {
    id: "objet",
    title: "1. Objet",
    content: [
      "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du service ValoStats, plateforme SaaS d'analyse et d'amélioration pour joueurs de Valorant.",
      "En créant un compte et en utilisant le service, vous acceptez sans réserve l'intégralité des présentes conditions.",
    ],
  },
  {
    id: "abonnement",
    title: "2. Abonnement et paiement",
    content: [
      "Le service est proposé en deux formules :",
    ],
    items: [
      "Formule gratuite (Free) — accès aux fonctionnalités de base",
      "Formule payante (Premium) — accès à l'ensemble des fonctionnalités, facturée mensuellement",
    ],
    details: [],
    paragraphs: [
      "L'abonnement Premium peut être résilié à tout moment depuis votre espace client. La résiliation prend effet à la fin de la période de facturation en cours.",
      "Aucun remboursement n'est assuré pour les périodes déjà facturées et entamées.",
    ],
  },
  {
    id: "donnees",
    title: "3. Données et API Riot Games",
    content: [
      "ValoStats utilise l'API publique Riot Games pour récupérer vos statistiques de jeu Valorant. En connectant votre compte Riot Games, vous autorisez ValoStats à accéder à ces données.",
      "Nous ne stockons que les données nécessaires au fonctionnement du service. Consultez notre Politique de Confidentialité pour plus d'informations.",
    ],
  },
  {
    id: "responsabilite",
    title: "4. Limitation de responsabilité",
    content: [
      "ValoStats s'efforce de fournir des données exactes et à jour, mais ne peut garantir l'exactitude absolue des statistiques affichées.",
      "Le service est fourni « en l'état » sans garantie expresse ou implicite.",
      "ValoStats ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du service.",
    ],
  },
  {
    id: "compte-utilisateur",
    title: "5. Compte utilisateur",
    content: [
      "Vous êtes responsable de la confidentialité de vos identifiants de connexion.",
      "Vous vous engagez à fournir des informations exactes lors de la création de votre compte.",
      "ValoStats se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes conditions.",
    ],
  },
  {
    id: "propriete-intellectuelle",
    title: "6. Propriété intellectuelle",
    content: [
      "ValoStats n'est pas affilié à Riot Games, Inc. VALORANT est une marque déposée de Riot Games, Inc.",
      "Tous les droits de propriété intellectuelle relatifs au service ValoStats (code, design, marque) sont réservés.",
    ],
  },
  {
    id: "contact-cgu",
    title: "7. Contact",
    content: [
      "Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse suivante :",
    ],
    details: [
      { label: "Email", value: LEGAL_CONTACT.email },
    ],
  },
] as const;
