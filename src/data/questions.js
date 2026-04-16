export const QCM_QUESTIONS = [
  {
    id: 1, section: "OFFRE DOLY",
    text: "Un propriétaire vous demande ce qui est inclus dans tous vos mandats sans exception. Que lui répondez-vous ?",
    multi: true,
    answers: ["Shooting photo professionnel", "Diagnostics remboursés", "Diffusion nationale et internationale", "Documents loi ALUR offerts", "Vérification financière de l'acquéreur par courtier partenaire", "Déménagement premium", "Service architecte sans option"],
    correct: [0, 2, 4]
  },
  {
    id: 2, section: "OFFRE DOLY",
    text: "Un propriétaire hésite entre Simple et Semi-exclusif. Quelle est la prestation concrète qui fait la différence ?",
    multi: false,
    answers: ["Le déménagement premium et les diagnostics remboursés", "Les documents loi ALUR", "La diffusion internationale", "La vérification financière acquéreur"],
    correct: [0]
  },
  {
    id: 3, section: "OFFRE DOLY",
    text: "Un propriétaire vous demande ce que l'Exclusif apporte de plus que le Semi-exclusif. Que lui citez-vous ?",
    multi: false,
    answers: ["Déménagement premium", "La stratégie de commercialisation personnalisée", "Service architecte inclus + diagnostics avancés + documents loi ALUR offerts", "Diffusion internationale"],
    correct: [2]
  },
  {
    id: 4, section: "OFFRE DOLY",
    text: "Vous rentrez un mandat à 250 000€. Quel taux d'honoraires s'applique ?",
    multi: false,
    answers: ["10% TTC", "7% TTC", "5% TTC", "3% TTC"],
    correct: [1]
  },
  {
    id: 5, section: "OFFRE DOLY",
    text: "Un propriétaire vous demande quel est le minimum légal de dépôt de garantie qu'un acquéreur doit verser à la signature du compromis.",
    multi: false,
    answers: ["5% du prix de vente", "Il n'existe pas de minimum légal", "10% du prix de vente", "Cela dépend du délai des conditions suspensives"],
    correct: [1]
  },
  {
    id: 6, section: "OFFRE DOLY",
    text: "À partir de quel prix de vente vos honoraires passent-ils à 5% TTC ?",
    multi: false,
    answers: ["200 001€", "250 001€", "300 001€", "350 001€"],
    correct: [2]
  },
  {
    id: 7, section: "DROIT IMMOBILIER",
    text: "Un propriétaire vous dit que son appartement fait 68m² mais il inclut le balcon. Qu'est-ce que la loi Carrez oblige à mentionner ?",
    multi: false,
    answers: ["La surface totale incluant les annexes", "La surface privative du lot uniquement (hors balcon, cave, parking)", "La surface des parties communes", "La surface au sol totale"],
    correct: [1]
  },
  {
    id: 8, section: "DROIT IMMOBILIER",
    text: "Un acquéreur signe un compromis un lundi. Il change d'avis le jeudi suivant. Peut-il se rétracter sans pénalité ?",
    multi: false,
    answers: ["Non, le compromis est définitif dès signature", "Oui, il dispose de 10 jours de rétractation", "Oui, mais il perd son dépôt de garantie", "Non, sauf si une condition suspensive s'applique"],
    correct: [1]
  },
  {
    id: 9, section: "DROIT IMMOBILIER",
    text: "La mairie reçoit la DIA pour un bien. De quoi s'agit-il et quel est son délai ?",
    multi: false,
    answers: ["La mairie dispose de 1 mois pour acheter le bien en priorité", "La mairie dispose de 2 mois pour exercer son droit de préemption ou y renoncer", "La mairie dispose de 3 mois pour donner son accord", "C'est une simple formalité sans délai imposé"],
    correct: [1]
  },
  {
    id: 10, section: "DROIT IMMOBILIER",
    text: "Vous avez un mandat sur un appartement loué. Le propriétaire veut vendre. Quelle est la première contrainte légale ?",
    multi: false,
    answers: ["Résilier le bail immédiatement", "Notifier au locataire son droit de préemption", "Attendre la fin du bail avant de mettre en vente", "Obtenir l'accord du syndic"],
    correct: [1]
  },
  {
    id: 11, section: "DROIT IMMOBILIER",
    text: "Qu'est-ce qu'une condition suspensive de financement dans un compromis ?",
    multi: false,
    answers: ["Une clause qui oblige l'acquéreur à obtenir son prêt sans délai", "Si le prêt est refusé dans les conditions prévues, l'acquéreur peut se retirer sans perdre son dépôt", "Une clause qui permet au vendeur d'annuler la vente si l'acquéreur n'obtient pas son prêt en 30 jours", "Si le prêt est refusé, l'acquéreur perd son dépôt de garantie"],
    correct: [1]
  },
  {
    id: 12, section: "DROIT IMMOBILIER",
    text: "La loi ALUR impose deux documents spécifiques au vendeur d'un lot en copropriété. Lesquels ?",
    multi: false,
    answers: ["Le carnet d'entretien et le DTG", "Le pré-état daté et l'état daté", "Le règlement de copropriété et le dernier PV d'AG", "Le diagnostic technique global et le bilan énergétique"],
    correct: [1]
  },
  {
    id: 13, section: "DROIT IMMOBILIER",
    text: "Un vendeur a acheté 300 000€ il y a 15 ans et revend 500 000€. C'est sa résidence principale. Est-il imposé sur la plus-value ?",
    multi: false,
    answers: ["Oui, à 19% sur les 200 000€ de bénéfice", "Non, la résidence principale est totalement exonérée", "Non, car il détient le bien depuis plus de 10 ans", "Oui, mais avec un abattement de 50%"],
    correct: [1]
  },
  {
    id: 14, section: "DROIT IMMOBILIER",
    text: "Un acquéreur possède un bien avec son frère depuis le décès de leurs parents, sans avoir rien formalisé. Dans quel régime se trouvent-ils ?",
    multi: false,
    answers: ["SCI familiale", "Indivision", "Nue-propriété partagée", "Copropriété familiale"],
    correct: [1]
  },
  {
    id: 15, section: "DROIT IMMOBILIER",
    text: "Un acquéreur vous parle d'un chemin traversant le jardin utilisé par le voisin. De quoi s'agit-il ?",
    multi: false,
    answers: ["Une hypothèque sur le bien", "Une servitude de passage", "Une clause du règlement de copropriété", "Une restriction municipale de construction"],
    correct: [1]
  },
  {
    id: 16, section: "DROIT IMMOBILIER",
    text: "Qu'est-ce que le droit de rétractation de l'acquéreur après signature du compromis et quel est son délai ?",
    multi: false,
    answers: ["L'acquéreur peut se rétracter jusqu'à la levée des conditions suspensives", "L'acquéreur dispose de 10 jours pour se rétracter sans justification ni pénalité", "L'acquéreur et le vendeur disposent de 10 jours pour se rétracter", "L'acquéreur dispose de 10 jours mais perd son dépôt s'il n'a pas de motif valable"],
    correct: [1]
  },
  {
    id: 17, section: "DROIT IMMOBILIER",
    text: "Qu'est-ce que la taxe foncière et qui la paie ?",
    multi: false,
    answers: ["C'est une taxe payée par le locataire chaque année", "C'est un impôt annuel payé par le propriétaire, qu'il soit occupant ou bailleur", "C'est une taxe payée uniquement lors de la vente", "C'est une taxe payée par la copropriété"],
    correct: [1]
  },
  {
    id: 18, section: "DROIT IMMOBILIER",
    text: "Un propriétaire veut vendre mais son bien a une hypothèque en cours. Qu'est-ce que ça implique ?",
    multi: false,
    answers: ["La vente est impossible tant que l'hypothèque court", "L'hypothèque sera levée lors de la signature de l'acte authentique", "L'acquéreur reprend l'hypothèque à son compte", "Il faut l'accord de la banque pour mettre en vente"],
    correct: [1]
  },
  {
    id: 19, section: "DROIT IMMOBILIER",
    text: "Quelle taxe est soumise au propriétaire d'un bien en location ?",
    multi: false,
    answers: ["La taxe foncière", "La taxe d'habitation sur les résidences secondaires", "Les charges de copropriété uniquement", "Une taxe supprimée pour tous les propriétaires depuis 2023"],
    correct: [0]
  },
  {
    id: 20, section: "DROIT IMMOBILIER",
    text: "Qu'est-ce que le syndicat des copropriétaires ?",
    multi: false,
    answers: ["C'est le cabinet professionnel payé pour gérer l'immeuble", "C'est l'ensemble des copropriétaires", "C'est le représentant élu par les copropriétaires pour négocier avec le syndic", "C'est l'organisme public qui contrôle la gestion des copropriétés"],
    correct: [1]
  },
  {
    id: 21, section: "COPROPRIÉTÉ",
    text: "Un appartement représente 156/10 000èmes. L'AG vote des travaux à 250 000€. Combien va-t-il payer ?",
    multi: false,
    answers: ["2 500€", "3 900€", "5 000€", "1 560€"],
    correct: [1]
  },
  {
    id: 22, section: "COPROPRIÉTÉ",
    text: "Qu'est-ce qu'un tantième et à quoi ça sert concrètement ?",
    multi: false,
    answers: ["Le montant des charges annuelles d'un lot", "La quote-part de chaque copropriétaire dans les parties communes — détermine charges et droits de vote", "Le nombre de voix en AG", "La superficie totale des parties communes"],
    correct: [1]
  },
  {
    id: 23, section: "COPROPRIÉTÉ",
    text: "L'acquéreur vous demande ce que contient le règlement de copropriété. Vous lui expliquez quoi ?",
    multi: false,
    answers: ["Le PV de la dernière assemblée générale", "Le contrat entre le syndic et les copropriétaires", "Le document fondateur de la copropriété : organisation, règles de vie, répartition des charges", "La liste des travaux votés en AG"],
    correct: [2]
  },
  {
    id: 24, section: "COPROPRIÉTÉ",
    text: "À quoi sert l'état daté et qui le paie ?",
    multi: false,
    answers: ["C'est un bilan des diagnostics, payé par l'acquéreur", "C'est le document qui récapitule les sommes dues par le vendeur à la copropriété, payé par le vendeur", "C'est un document établi par le notaire", "C'est un bilan financier de la copro, payé par le syndic"],
    correct: [1]
  },
  {
    id: 25, section: "COPROPRIÉTÉ",
    text: "Le propriétaire vous parle d'un document récapitulant la situation financière de la copro et les procédures en cours, fourni pour le compromis. De quoi s'agit-il ?",
    multi: false,
    answers: ["L'état daté", "Le pré-état daté", "Le DTG", "Le PV d'AG"],
    correct: [1]
  },
  {
    id: 26, section: "COPROPRIÉTÉ",
    text: "L'AG de la copropriété vote au titre de l'article 24. Qu'est-ce que ça signifie ?",
    multi: false,
    answers: ["Vote à l'unanimité de tous les copropriétaires", "Vote à la majorité absolue de tous les copropriétaires présents, représentés et absents", "Vote à la majorité simple des voix des copropriétaires présents et représentés", "Vote à la double majorité en nombre et en tantièmes"],
    correct: [2]
  },
  {
    id: 27, section: "COPROPRIÉTÉ",
    text: "L'AG vote au titre de l'article 25. C'est quoi concrètement ?",
    multi: false,
    answers: ["La majorité simple des présents", "La majorité absolue de tous les copropriétaires (présents, représentés ou absents)", "La majorité absolue des copropriétaires présents uniquement", "La double majorité en nombre et en tantièmes"],
    correct: [1]
  },
  {
    id: 28, section: "COPROPRIÉTÉ",
    text: "L'AG vote au titre de l'article 26. C'est quoi concrètement ?",
    multi: false,
    answers: ["La majorité simple des voix des présents et représentés", "La majorité absolue de tous les copropriétaires", "La double majorité : majorité en nombre ET majorité des deux tiers des tantièmes", "L'unanimité de tous les copropriétaires"],
    correct: [2]
  },
  {
    id: 29, section: "COPROPRIÉTÉ",
    text: "Un copropriétaire vend son lot avec des charges impayées depuis 2 ans. Qui est redevable ?",
    multi: false,
    answers: ["L'acquéreur, il reprend les dettes avec le lot", "Le vendeur", "Le syndic absorbe les impayés", "Les impayés sont annulés lors de la vente"],
    correct: [1]
  },
  {
    id: 30, section: "COPROPRIÉTÉ",
    text: "Qu'est-ce qu'un fonds de travaux en copropriété et quel est le minimum légal ?",
    multi: false,
    answers: ["Une épargne facultative d'au minimum 3% du budget prévisionnel", "Une cotisation annuelle obligatoire d'au minimum 5% du budget prévisionnel", "Une subvention de l'État pour les immeubles anciens", "Un fonds de réserve uniquement pour les urgences, financé par le syndic"],
    correct: [1]
  },
  {
    id: 31, section: "COPROPRIÉTÉ",
    text: "Lors d'une visite d'un immeuble ancien, l'acquéreur vous demande ce qu'est le carnet d'entretien. Vous lui expliquez quoi ?",
    multi: false,
    answers: ["La liste des copropriétaires et leurs tantièmes", "Le document retraçant l'historique des travaux, contrats d'entretien et équipements de l'immeuble", "Le budget prévisionnel annuel voté en AG", "Le registre des incidents déclarés par les copropriétaires"],
    correct: [1]
  },
  {
    id: 32, section: "COPROPRIÉTÉ",
    text: "Qu'est-ce qu'implique la jouissance exclusive d'un bien ?",
    multi: false,
    answers: ["Le droit d'utiliser seul un bien sans en être forcément propriétaire", "Le droit de devenir automatiquement propriétaire après 3 ans", "Le droit d'utiliser seul un bien mais avec obligation de partager l'usage", "Le droit de vendre sans être imposé"],
    correct: [0]
  },
  {
    id: 33, section: "DIAGNOSTICS",
    text: "Un acquéreur vous demande ce que mesure le DPE et ce que signifie la note.",
    multi: false,
    answers: ["Il mesure la surface habitable selon la loi Boutin", "Il mesure le taux de déperdition énergétique et les émissions de CO2 — classé de A à G", "Il mesure la qualité de l'air intérieur et la présence de polluants", "Il mesure la conformité des installations électriques et gaz"],
    correct: [1]
  },
  {
    id: 34, section: "DIAGNOSTICS",
    text: "Vous avez un mandat sur un appartement classé DPE G. Le propriétaire veut le louer en attendant de vendre. Que lui dites-vous ?",
    multi: false,
    answers: ["Depuis 2025, les logements G peuvent être loués normalement mais avec un loyer plafonné", "Depuis 2025, les logements G ne peuvent plus être mis en location en code d'habitation, mais c'est possible en code civil", "Depuis 2022, les logements G ne peuvent plus être loués catégoriquement", "Depuis 2024, les logements G ne peuvent plus être loués en code civil"],
    correct: [1]
  },
  {
    id: 35, section: "DIAGNOSTICS",
    text: "Combien de temps est valable le DPE ?",
    multi: false,
    answers: ["1 an", "5 ans", "10 ans", "Illimité"],
    correct: [2]
  },
  {
    id: 36, section: "DIAGNOSTICS",
    text: "Vous rentrez un mandat sur un appartement dans un immeuble de 1890. Quels diagnostics sont obligatoires ?",
    multi: true,
    answers: ["DPE", "Diagnostic amiante", "CREP (plomb)", "Diagnostic termites (si zone délimitée)", "Diagnostic électricité", "Diagnostic gaz", "État des risques et pollutions (ERP)"],
    correct: [0, 1, 2, 3, 4, 5, 6]
  },
  {
    id: 37, section: "DIAGNOSTICS",
    text: "À quels biens s'applique le CREP (Constat de Risque d'Exposition au Plomb) ?",
    multi: false,
    answers: ["Tous les biens construits avant 2000", "Les biens construits avant 1949", "Tous les biens construits avant 1975", "Les maisons individuelles uniquement"],
    correct: [1]
  },
  {
    id: 38, section: "DIAGNOSTICS",
    text: "Qu'est-ce que le DPE \"opposable\" depuis 2021 signifie concrètement ?",
    multi: false,
    answers: ["Il peut exiger que le vendeur réalise des travaux avant la vente", "Il peut se retourner contre le vendeur si le DPE s'avère erroné et lui a causé un préjudice financier", "Il peut annuler la vente si le DPE est inférieur à D", "Il peut demander une réduction de prix proportionnelle à la note DPE"],
    correct: [1]
  },
  {
    id: 39, section: "DIAGNOSTICS",
    text: "À qui incombe la réalisation des diagnostics et que se passe-t-il s'il en manque un ?",
    multi: false,
    answers: ["C'est à l'acquéreur de les commander", "C'est au vendeur ; s'il en manque un, l'acquéreur peut demander une réduction ou l'annulation", "Si une agence est mandatée, la responsabilité lui est automatiquement transférée", "C'est au notaire de les commander si besoin"],
    correct: [1]
  },
  {
    id: 40, section: "DIAGNOSTICS",
    text: "Qu'est-ce que l'ERP ?",
    multi: false,
    answers: ["Un diagnostic sur la qualité de l'air intérieur", "Un document informant des risques naturels, miniers, technologiques, sismiques et de pollution des sols", "Un diagnostic sur les nuisances sonores du quartier", "Un bilan environnemental de la commune entière"],
    correct: [1]
  },
  {
    id: 41, section: "DIAGNOSTICS",
    text: "Un bien vendu à Paris dans un immeuble classé F — le vendeur dit qu'il n'a pas eu besoin d'audit énergétique. A-t-il raison ?",
    multi: false,
    answers: ["Non, l'audit est obligatoire pour tous les biens classés E, F ou G", "Oui, l'audit est obligatoire uniquement pour les maisons et immeubles en monopropriété classés F ou G, pas pour les appartements en copropriété", "Non, l'audit est obligatoire pour tous les biens en copropriété construits avant 1975", "Oui, l'audit n'est jamais obligatoire pour une vente"],
    correct: [1]
  },
  {
    id: 42, section: "FINANCEMENT",
    text: "Votre acquéreur gagne 4 000€ nets par mois, sans crédit en cours. Quelle est sa mensualité maximale selon la règle des 35% ?",
    multi: false,
    answers: ["1 200€", "1 400€", "1 600€", "1 800€"],
    correct: [1]
  },
  {
    id: 43, section: "FINANCEMENT",
    text: "Votre acquéreur est entrepreneur depuis 5 ans. Comment la banque calcule-t-elle ses revenus ?",
    multi: false,
    answers: ["Sur son chiffre d'affaires annuel sur les 2 dernières années", "Sur son dernier bilan uniquement", "Sur la moyenne des 3 derniers bilans comptables", "Sur le salaire mensuel qu'il se verse"],
    correct: [2]
  },
  {
    id: 44, section: "FINANCEMENT",
    text: "Un acquéreur vous dit que sa banque est favorable. Quel document n'est pas une garantie ?",
    multi: false,
    answers: ["Un contrat de prêt définitif", "Un accord de principe bancaire", "Une garantie de financement d'un assureur", "Un avis favorable du courtier"],
    correct: [3]
  },
  {
    id: 45, section: "FINANCEMENT",
    text: "Un acquéreur a un crédit voiture à 300€/mois et gagne 5 000€ nets. Quelle mensualité maximale pour son prêt immobilier ?",
    multi: false,
    answers: ["1 750€", "1 450€", "1 550€", "1 200€"],
    correct: [1]
  },
  {
    id: 46, section: "FINANCEMENT",
    text: "Quelle est la différence entre une hypothèque et une caution Crédit Logement ?",
    multi: false,
    answers: ["C'est la même chose, deux termes pour la même garantie", "L'hypothèque est une garantie prise sur le bien via acte notarié, la caution est une garantie d'un organisme tiers sans acte notarié", "La caution est réservée aux investisseurs, l'hypothèque aux primo-accédants", "L'hypothèque est remboursée par l'État"],
    correct: [1]
  },
  {
    id: 47, section: "FINANCEMENT",
    text: "Qu'est-ce qu'un primo-accédant exactement ?",
    multi: false,
    answers: ["C'est quelqu'un qui n'a pas été propriétaire de sa résidence principale au cours des 2 dernières années", "C'est quelqu'un qui achète un bien pour la toute première fois de sa vie", "C'est quelqu'un qui achète uniquement dans le neuf", "C'est quelqu'un dont c'est le premier achat en Île-de-France"],
    correct: [1]
  },
  {
    id: 48, section: "FINANCEMENT",
    text: "À quoi sert concrètement un courtier en financement ?",
    multi: false,
    answers: ["Il accorde lui-même les prêts immobiliers sans passer par une banque", "Il compare les offres de plusieurs banques pour obtenir le meilleur taux et accompagne le dossier jusqu'à l'accord de prêt", "Il garantit à l'acquéreur l'obtention de son prêt quelle que soit sa situation", "Il intervient uniquement si l'acquéreur a un dossier complexe"],
    correct: [1]
  },
  {
    id: 49, section: "FINANCEMENT",
    text: "Parmi les éléments suivants, lesquels constituent des red flags dans un dossier de crédit ? (plusieurs réponses)",
    multi: true,
    answers: ["Des virements entrants irréguliers en montant d'un mois sur l'autre", "Un changement d'employeur dans les 6 mois précédant la demande, même en CDI", "Une présence de jeux d'argent dans les relevés bancaires", "Une période d'essai terminée depuis moins de 3 mois", "Des abonnements mensuels élevés (box, streaming, sport)", "Un solde de compte systématiquement bas en fin de mois malgré des revenus élevés"],
    correct: [0, 1, 2, 3, 5]
  },
  {
    id: 50, section: "FINANCEMENT",
    text: "Un acquéreur vous demande la différence entre un mandat de recherche et un mandat de vente. Lequel protège le mieux ses intérêts d'acheteur ?",
    multi: false,
    answers: ["Le mandat de vente, car l'agent travaille pour lui", "Le mandat de recherche, car l'agent est mandaté exclusivement pour trouver le bien correspondant à ses critères", "Les deux sont équivalents en termes de protection", "Il n'existe pas de mandat de recherche en France"],
    correct: [1]
  }
];

export const OPEN_QUESTIONS = [
  { id: 1, cat: "OBJECTIONS PROPRIO", text: "Vous appelez un propriétaire en prospection. Il vous dit dès le départ : \"Je ne veux pas d'agence.\" Comment réagissez-vous ?" },
  { id: 2, cat: "OBJECTIONS PROPRIO", text: "Vous êtes en RDV. Le propriétaire vous dit qu'il a déjà un mandat simple avec une autre agence. Vous allez au RDV ou pas ? Pourquoi ? Et si vous y allez, comment vous positionnez-vous ?" },
  { id: 3, cat: "OBJECTIONS PROPRIO", text: "Le propriétaire vous dit : \"Je connais quelqu'un qui a vendu par lui-même, je vais vendre entre particuliers.\" Quelle est votre réaction et quels arguments développez-vous ?" },
  { id: 4, cat: "OBJECTIONS PROPRIO", text: "Lors du RDV de mandat, le propriétaire vous dit : \"Vos honoraires sont trop élevés, l'agence d'en face fait moins cher.\" Comment vous positionnez-vous ?" },
  { id: 5, cat: "OBJECTIONS PROPRIO", text: "Le propriétaire hésite entre vous signer un mandat simple ou rester en vente seul encore 2 mois. Il dit : \"Je vais encore essayer seul.\" Qu'est-ce que vous lui dites ?" },
  { id: 6, cat: "OBJECTIONS PROPRIO", text: "Vous avez fait un RDV de mandat il y a 10 jours. Le propriétaire ne répond plus. C'est votre 3e tentative de contact. Comment vous gérez cet appel de relance ?" },
  { id: 7, cat: "OBJECTIONS PROPRIO", text: "Vous êtes sur le point de signer un mandat pour un bien estimé à 800 000€. Le propriétaire insiste pour garder son prix de 900 000€. Comment gérez-vous cette situation ?" },
  { id: 8, cat: "OBJECTIONS PROPRIO", text: "Le propriétaire vous dit : \"J'ai déjà eu une mauvaise expérience avec une agence, ils ne faisaient rien.\" Quelle est votre posture et comment vous rassurez-vous sans dénigrer la concurrence ?" },
  { id: 9, cat: "OBJECTIONS PROPRIO", text: "En prospection téléphonique, un propriétaire vous dit : \"Ce n'est pas le bon moment, rappelez-moi dans 6 mois.\" Comment réagissez-vous ?" },
  { id: 10, cat: "OBJECTIONS PROPRIO", text: "Lors du RDV de mandat, le propriétaire refuse de vous donner les clés. Il veut être présent à chaque visite. Quels impacts lui expliquez-vous et comment le convainquez-vous ?" },
  { id: 11, cat: "BLOCAGES", text: "Votre acquéreur visite un appartement, il est clairement intéressé mais il reste silencieux pendant toute la visite. Qu'est-ce que vous faites ?" },
  { id: 12, cat: "BLOCAGES", text: "Un acquéreur veut faire une offre à 50 000€ en dessous du prix affiché sur un bien à 600 000€ en justifiant par \"il y a des travaux\". Comment vous gérez cette situation des deux côtés ?" },
  { id: 13, cat: "BLOCAGES", text: "Un acquéreur vous appelle pour un 3 pièces Paris 9e, 500 000€ max. Vous n'avez rien en stock. Vous faites quoi ?" },
  { id: 14, cat: "BLOCAGES", text: "Le notaire vendeur est basé à Sainte-Maxime, la signature traîne, les délais s'allongent. Quels leviers enclenchez-vous pour débloquer la situation ?" },
  { id: 15, cat: "BLOCAGES", text: "Le vendeur commence à paniquer — 6 semaines de commercialisation, 4 visites, aucune offre. Il veut retirer le mandat. Comment gérez-vous cet appel ?" },
  { id: 16, cat: "BLOCAGES", text: "L'acquéreur n'obtient pas son prêt. Que se passe-t-il pour le dépôt de garantie, pour la vente, et quel est votre rôle à ce moment-là ?" },
  { id: 17, cat: "BLOCAGES", text: "Votre acquéreur est intéressé mais n'a pas encore vu de courtier et n'a aucun accord de principe. Il veut faire une offre maintenant. Comment vous gérez ça ?" },
  { id: 18, cat: "BLOCAGES", text: "Le vendeur reçoit une offre 30 000€ en dessous de son prix sur un bien à 300 000€. Il refuse catégoriquement sans contre-proposer. Comment vous intervenez en tant qu'intermédiaire ?" },
  { id: 19, cat: "COMMERCIALISATION", text: "Vous rentrez un mandat exclusif sur un 65 m² situé au 42 rue Oberkampf, 75011 Paris, au prix de 720 000€. Citez et expliquez tous les leviers de commercialisation que vous allez activer dans l'ordre." },
  { id: 20, cat: "COMMERCIALISATION", text: "Un bien est en ligne depuis 4 semaines. Vous avez eu 8 demandes de visite mais seulement 3 visites effectives. Le reste a annulé. Quelle est votre analyse et que faites-vous ?" },
  { id: 21, cat: "COMMERCIALISATION", text: "Un propriétaire vous demande pourquoi vous voulez faire un shooting photo professionnel — \"mon iPhone fait très bien l'affaire\". Comment lui expliquez-vous l'intérêt concret ?" },
  { id: 22, cat: "COMMERCIALISATION", text: "Vous avez un 120 m² avec balcon au 10 rue de Paradis, 75010 Paris, sans travaux, au prix de 1 200 000€. Quelle est la meilleure stratégie de commercialisation et pourquoi ?" },
  { id: 23, cat: "COMMERCIALISATION", text: "Un bien tourne depuis 2 mois sans offre. Le propriétaire ne veut pas baisser le prix. Quels autres leviers activez-vous avant d'en arriver à la baisse de prix ?" },
  { id: 24, cat: "COMMERCIALISATION", text: "Un bien est en ligne depuis 2 semaines. Vous n'avez reçu aucune demande de visite. Quelle est votre analyse et quelles actions enclenchez-vous en priorité ?" },
  { id: 25, cat: "COMMERCIALISATION", text: "À l'issue d'un RDV de mandat, le propriétaire est partant mais reste convaincu qu'avoir plusieurs agences augmente les chances de vendre. Comment vous positionnez-vous ?" },
  { id: 26, cat: "TERRAIN", text: "En visite, l'acquéreur est clairement emballé mais son conjoint passe la visite entière à chercher des défauts et à soupirer. Comment adaptez-vous votre posture ?" },
  { id: 27, cat: "TERRAIN", text: "Vous êtes en visite et l'acquéreur vous demande : \"Est-ce qu'on peut transformer cette pièce en bureau pour exercer ma profession libérale ?\" Qu'est-ce que vous vérifiez et que lui répondez-vous ?" },
  { id: 28, cat: "TERRAIN", text: "Pendant une visite, l'acquéreur vous demande directement : \"Est-ce qu'il y a une marge de négociation ?\" Que lui répondez-vous ?" },
  { id: 29, cat: "TERRAIN", text: "Le propriétaire vous appelle après 3 semaines pour vous dire qu'il a trouvé un acheteur tout seul, \"un ami qui cherchait\". Que faites-vous ?" },
  { id: 30, cat: "TERRAIN", text: "Vous rentrez à l'agence après un RDV de visite. Votre directeur vous demande : \"Il fait quoi dans la vie l'acquéreur ?\" et vous ne savez pas répondre. Qu'est-ce que ça révèle et qu'est-ce que vous auriez dû faire ?" }
];

// Seeded random shuffle based on candidate name
export function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function drawQuestions(candidateName) {
  const seed = stringToSeed(candidateName.toLowerCase().trim());
  const shuffledQCM = seededShuffle(QCM_QUESTIONS, seed);
  const shuffledOpen = seededShuffle(OPEN_QUESTIONS, seed + 1);
  return {
    qcm: shuffledQCM.slice(0, 20),
    open: shuffledOpen.slice(0, 10)
  };
}
