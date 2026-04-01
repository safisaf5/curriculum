export const cvData = {
  profile: {
    name: 'Safwan Abdirahman',
    title: { fr: 'CEO & Fondateur', en: 'CEO & Founder' },
    nationality: { fr: 'Suisse', en: 'Swiss' },
    origin: { fr: 'Romont FR (Fribourg), Suisse', en: 'Romont FR (Fribourg), Switzerland' },
    location: { fr: 'Genève, Suisse', en: 'Geneva, Switzerland' },
    contact: {
      phone: '+41 (0) 78 963 62 23',
      email: 'Abdirahman@Safwan.ch',
      linkedin: 'https://www.linkedin.com/in/safwanab',
      website: 'https://sbsa.agency/',
    },
    summary: {
      fr: "Leader naturel, j'apporte une vision stratégique claire et mobilise efficacement les équipes. Analytique et polyvalent, j'excelle dans les environnements complexes. Mon exigence pousse vers l'excellence, et ma réflexion approfondie garantit des décisions solides. Professionnel polyvalent avec une expérience diversifiée dans des secteurs variés tels que l'hôtellerie, la pharmacie, l'ingénierie, l'horlogerie et les technologies de l'information. Passionné par l'apprentissage et le développement personnel, je m'efforce d'exceller dans chaque opportunité qui m'est offerte.",
      en: "Natural leader, I bring a clear strategic vision and effectively mobilize teams. Analytical and versatile, I excel in complex environments. My high standards drive excellence, and my deep thinking ensures solid decisions. Versatile professional with diverse experience across sectors such as hospitality, pharmacy, engineering, watchmaking, and information technology. Passionate about learning and personal development, I strive to excel in every opportunity presented to me."
    },
  },

  permits: [
    { name: { fr: 'Permis Voiture et Moto A2', en: 'Car & Motorcycle License A2' }, category: { fr: 'Conduite', en: 'Driving' } },
    { name: { fr: 'Permis Pilote de Drone A1/A3', en: 'Drone Pilot License A1/A3' }, category: { fr: 'Aérien', en: 'Aerial' } },
    { name: { fr: 'Permis Chauffeur Professionnel', en: 'Professional Driver License' }, category: { fr: 'Conduite professionnelle', en: 'Professional driving' } },
  ],

  languages: [
    {
      name: { fr: 'Français', en: 'French' },
      level: { fr: 'Natif', en: 'Native' },
      cecrl: 'C2',
      details: { fr: 'Langue maternelle', en: 'Mother tongue' },
    },
    {
      name: { fr: 'Anglais', en: 'English' },
      level: { fr: 'Intermédiaire supérieur', en: 'Upper Intermediate' },
      cecrl: 'B2',
      certification: 'Cambridge English FCE',
      certDetails: { fr: 'Score global : 172 | Grade C | Examen du 20 avril 2024', en: 'Overall score: 172 | Grade C | Exam date: April 20, 2024' },
    },
    {
      name: { fr: 'Arabe', en: 'Arabic' },
      level: { fr: 'Courant', en: 'Fluent' },
      cecrl: 'B2-C1',
      details: { fr: 'École Arabe de Genève (2010-2020, 10 ans)', en: 'Arabic School of Geneva (2010-2020, 10 years)' },
    },
    {
      name: { fr: 'Italien', en: 'Italian' },
      level: { fr: 'Intermédiaire supérieur', en: 'Upper Intermediate' },
      cecrl: 'B2',
      certification: 'DILI-B2 (AIL Firenze)',
      certDetails: { fr: 'Examen du 16 mars 2024 à Florence, Italie', en: 'Exam date: March 16, 2024 in Florence, Italy' },
    },
    {
      name: { fr: 'Allemand', en: 'German' },
      level: { fr: 'Notions / Élémentaire', en: 'Elementary' },
      cecrl: 'A2-B1',
      details: { fr: 'Acquis durant le service militaire à Thoune (Berne)', en: 'Acquired during military service in Thun (Bern)' },
    },
  ],

  experience: [
    {
      title: { fr: 'Agent de Sécurité', en: 'Security Agent' },
      company: 'Securitas',
      period: { fr: 'Juin 2025 – Fév. 2026', en: 'Jun 2025 – Feb 2026' },
      location: { fr: 'Genève, Suisse', en: 'Geneva, Switzerland' },
      type: 'work' as const,
    },
    {
      title: { fr: 'Co-fondateur – Agence B2B personnalisation textile & print', en: 'Co-founder – B2B Textile & Print Customization Agency' },
      company: 'SBSA',
      period: { fr: 'Jan. 2021 – Présent', en: 'Jan 2021 – Present' },
      location: { fr: 'Genève, Suisse', en: 'Geneva, Switzerland' },
      description: {
        fr: "Accompagnement d'écoles, associations, clubs et entreprises de l'idée à la livraison : conseil, création/PAO, production (broderie, sérigraphie, DTG, DTF, flocage), contrôle qualité et logistique. Print : cartes de visite, flyers, brochures, PLV, goodies.",
        en: "Supporting schools, associations, clubs and companies from idea to delivery: consulting, design/DTP, production (embroidery, screen printing, DTG, DTF, flocking), quality control and logistics. Print: business cards, flyers, brochures, POS, goodies."
      },
      type: 'work' as const,
    },
    {
      title: { fr: 'Fondateur & Responsable technique – Réparation smartphones, Mac & PC', en: 'Founder & Technical Manager – Smartphone, Mac & PC Repair' },
      company: 'Heal ElectroniX',
      period: { fr: 'Juil. 2020 – Présent', en: 'Jul 2020 – Present' },
      location: { fr: 'Genève, Suisse', en: 'Geneva, Switzerland' },
      description: {
        fr: "Atelier de réparation & micro-soudure : diagnostic, devis, réparations (écrans, batteries, caméras, connecteurs, désoxydation), récupération de données. Services B2B : maintenance préventive, facturation centralisée, effacement sécurisé.",
        en: "Repair & micro-soldering workshop: diagnostics, quotes, repairs (screens, batteries, cameras, connectors, de-oxidation), data recovery. B2B services: preventive maintenance, centralized billing, secure data wiping."
      },
      type: 'work' as const,
    },
    {
      title: { fr: 'Opérations Concessions & Merchandising', en: 'Concessions & Merchandising Operations' },
      company: 'Le Groupe Cirque du Soleil',
      period: { fr: 'Mai – Juin 2025', en: 'May – Jun 2025' },
      location: { fr: 'Genève, Suisse', en: 'Geneva, Switzerland' },
      description: {
        fr: "Accueil et conseil client, encaissement POS, vente et upsell, opérations Photobooth, réassort & inventaire, hygiène et sécurité. Communication FR/EN.",
        en: "Customer reception and advice, POS checkout, sales and upselling, Photobooth operations, restocking & inventory, hygiene and safety. FR/EN communication."
      },
      type: 'work' as const,
    },
    {
      title: { fr: 'Explorateur Radio', en: 'Radio Explorer' },
      company: { fr: 'Armée Suisse', en: 'Swiss Army' },
      period: { fr: 'Jan. – Mai 2025', en: 'Jan – May 2025' },
      location: { fr: 'Thoune, Berne, Suisse', en: 'Thun, Bern, Switzerland' },
      description: {
        fr: "Service militaire obligatoire. Communications tactiques et reconnaissance électronique. Grade : Soldat.",
        en: "Mandatory military service. Tactical communications and electronic reconnaissance. Rank: Private."
      },
      type: 'military' as const,
    },
    {
      title: { fr: 'Serveur', en: 'Waiter' },
      company: 'Saveurs et Couleurs',
      period: { fr: 'Sept. – Nov. 2024', en: 'Sep – Nov 2024' },
      location: { fr: 'Genève, Suisse', en: 'Geneva, Switzerland' },
      type: 'work' as const,
    },
    {
      title: { fr: 'Agent SPH', en: 'SPH Agent' },
      company: { fr: 'Hôpital de Belle-Idée', en: 'Belle-Idée Hospital' },
      period: { fr: 'Juil. – Déc. 2024', en: 'Jul – Dec 2024' },
      location: { fr: 'Genève, Suisse', en: 'Geneva, Switzerland' },
      type: 'work' as const,
    },
    {
      title: { fr: 'Coursier Livreur', en: 'Delivery Courier' },
      company: 'Notime / La Poste',
      period: { fr: 'Nov. 2023 – Août 2024', en: 'Nov 2023 – Aug 2024' },
      location: { fr: 'Genève, Suisse', en: 'Geneva, Switzerland' },
      type: 'work' as const,
    },
    {
      title: { fr: 'WebMaster', en: 'WebMaster' },
      company: 'Association Mamajah',
      period: { fr: 'Fév. 2022 – Avr. 2023', en: 'Feb 2022 – Apr 2023' },
      description: {
        fr: "Gestion et maintenance du site web, développement de fonctionnalités, amélioration UX.",
        en: "Website management and maintenance, feature development, UX improvement."
      },
      type: 'work' as const,
    },
    {
      title: { fr: 'Opérateur saisie de données', en: 'Data Entry Operator' },
      company: 'Crypto-Expert',
      period: { fr: 'Oct. – Déc. 2021', en: 'Oct – Dec 2021' },
      location: { fr: 'Genève, Suisse', en: 'Geneva, Switzerland' },
      description: {
        fr: "Analyse et organisation d'informations pour optimiser les processus internes.",
        en: "Analysis and organization of information to optimize internal processes."
      },
      type: 'work' as const,
    },
    {
      title: { fr: 'Technicien sur Piano', en: 'Piano Technician' },
      company: 'PianosFM',
      period: { fr: 'Mai 2022', en: 'May 2022' },
      type: 'work' as const,
    },
    {
      title: { fr: 'Réparateur de téléphone', en: 'Phone Repair Technician' },
      company: 'PhoneLab Store',
      period: { fr: 'Juin 2021', en: 'Jun 2021' },
      type: 'work' as const,
    },
    {
      title: { fr: 'Stagiaire – Hôtellerie', en: 'Intern – Hospitality' },
      company: 'InterContinental Genève / Crowne Plaza Geneva',
      period: { fr: 'Oct. 2022', en: 'Oct 2022' },
      description: {
        fr: "Découverte des services : F&B, cuisine, réception, housekeeping, informatique hôtelière.",
        en: "Discovery of hotel departments: F&B, kitchen, reception, housekeeping, hotel IT systems."
      },
      type: 'stage' as const,
    },
    {
      title: { fr: 'Stage d\'observation en pédiatrie', en: 'Pediatrics Observation Internship' },
      company: { fr: 'Garde pédiatrique de Lancy', en: 'Lancy Pediatric Practice' },
      period: { fr: 'Oct. 2019', en: 'Oct 2019' },
      description: {
        fr: "Observation des pratiques médicales, participation à la gestion des soins aux enfants.",
        en: "Observation of medical practices, participation in children's care management."
      },
      type: 'stage' as const,
    },
    {
      title: { fr: 'Stage de Pharmacien', en: 'Pharmacy Internship' },
      company: 'Amavita',
      period: { fr: 'Oct. 2019', en: 'Oct 2019' },
      description: {
        fr: "Dispensation de médicaments, gestion des stocks, conseil client, bonnes pratiques pharmaceutiques.",
        en: "Medication dispensing, stock management, customer advice, good pharmaceutical practices."
      },
      type: 'stage' as const,
    },
    {
      title: { fr: 'Stage en horlogerie', en: 'Watchmaking Internship' },
      company: 'ROLEX',
      period: { fr: 'Oct. 2019', en: 'Oct 2019' },
      description: {
        fr: "Tâches nécessitant minutie et précision, assemblage et contrôle qualité dans l'horlogerie de luxe.",
        en: "Tasks requiring meticulousness and precision, assembly and quality control in luxury watchmaking."
      },
      type: 'stage' as const,
    },
    {
      title: { fr: 'Stage en ingénierie', en: 'Engineering Internship' },
      company: 'HEPIA – Haute école du paysage, d\'ingénierie et d\'architecture',
      period: { fr: 'Juil. 2018', en: 'Jul 2018' },
      description: {
        fr: "Introduction aux principes d'ingénierie, projets techniques sous supervision académique.",
        en: "Introduction to engineering principles, technical projects under academic supervision."
      },
      type: 'stage' as const,
    },
    {
      title: { fr: 'Stage d\'observation Polymécanicien', en: 'Polymechanic Observation Internship' },
      company: 'CFPT – Centre de Formation Professionnelle Technique',
      period: { fr: 'Mai 2018', en: 'May 2018' },
      description: {
        fr: "Découverte de la mécanique de précision, processus de fabrication et assemblage.",
        en: "Discovery of precision mechanics, manufacturing and assembly processes."
      },
      type: 'stage' as const,
    },
    {
      title: { fr: 'Ingénieur en téléphonie mobile (stage)', en: 'Mobile Phone Engineer (Internship)' },
      company: 'Golden Dreams Geneva',
      period: { fr: 'Avr. 2017', en: 'Apr 2017' },
      description: {
        fr: "Personnalisation d'iPhones : remplacement de châssis par des modèles de luxe en or ou gravés. Grande précision technique.",
        en: "iPhone customization: replacing chassis with luxury gold or engraved models. High technical precision required."
      },
      type: 'stage' as const,
    },
  ],

  education: [
    {
      institution: { fr: 'EPFL (École Polytechnique Fédérale de Lausanne)', en: 'EPFL (Swiss Federal Institute of Technology Lausanne)' },
      degree: { fr: 'Cours de Mathématiques Spéciales (CMS)', en: 'Special Mathematics Course (CMS)' },
      period: { fr: 'Sept. 2025 – Juil. 2026', en: 'Sep 2025 – Jul 2026' },
      status: { fr: 'En cours', en: 'In progress' },
      description: {
        fr: "Programme préparatoire intensif : analyse, algèbre linéaire, géométrie et physique.",
        en: "Intensive preparatory program: analysis, linear algebra, geometry and physics."
      },
    },
    {
      institution: { fr: 'Université de Genève', en: 'University of Geneva' },
      degree: { fr: 'Bachelor en Psychologie', en: 'Bachelor in Psychology' },
      period: { fr: 'Sept. 2024', en: 'Sep 2024' },
      status: { fr: 'Non complété / Réorientation', en: 'Not completed / Reorientation' },
    },
    {
      institution: { fr: 'ifage (Fondation pour la formation des adultes)', en: 'ifage (Adult Education Foundation)' },
      degree: { fr: 'Diplôme Cantonal de Cafetier – Patente de Cafetier, Genève', en: 'Cantonal Café Owner Diploma – Geneva' },
      period: { fr: 'Sept. – Nov. 2024', en: 'Sep – Nov 2024' },
      description: {
        fr: "Gestion de restaurants, hygiène et sécurité alimentaire, traitement des salaires, droit du travail, gestion d'équipe.",
        en: "Restaurant management, food hygiene and safety, payroll processing, labor law, team management."
      },
    },
    {
      institution: { fr: 'Collège Voltaire', en: 'Collège Voltaire' },
      degree: { fr: 'Maturité gymnasiale avec mention', en: 'High School Diploma with Honors' },
      period: { fr: 'Sept. 2019 – Juil. 2024', en: 'Sep 2019 – Jul 2024' },
      speciality: { fr: 'Biochimie', en: 'Biochemistry' },
      average: '5.1/6',
      grades: [
        { subject: { fr: 'Français', en: 'French' }, grade: '4.5', type: 'DF' },
        { subject: { fr: 'Italien', en: 'Italian' }, grade: '5.0', type: 'DF' },
        { subject: { fr: 'Anglais', en: 'English' }, grade: '5.0', type: 'DF' },
        { subject: { fr: 'Mathématiques (niveau avancé)', en: 'Mathematics (advanced)' }, grade: '5.0', type: 'DF' },
        { subject: { fr: 'Biologie', en: 'Biology' }, grade: '5.5', type: 'DF' },
        { subject: { fr: 'Chimie', en: 'Chemistry' }, grade: '5.5', type: 'DF' },
        { subject: { fr: 'Physique', en: 'Physics' }, grade: '5.0', type: 'DF' },
        { subject: { fr: 'Histoire', en: 'History' }, grade: '5.0', type: 'DF' },
        { subject: { fr: 'Géographie', en: 'Geography' }, grade: '4.5', type: 'DF' },
        { subject: { fr: 'Philosophie', en: 'Philosophy' }, grade: '4.5', type: 'DF' },
        { subject: { fr: 'Arts visuels', en: 'Visual Arts' }, grade: '4.5', type: 'DF' },
        { subject: { fr: 'Biologie et chimie (OS)', en: 'Biology & Chemistry (SO)' }, grade: '5.0', type: 'OS' },
        { subject: { fr: 'Économie et droit (OC)', en: 'Economics & Law (CO)' }, grade: '4.5', type: 'OC' },
        { subject: { fr: 'Travail de maturité', en: 'Maturity Thesis' }, grade: '6.0', type: 'TM' },
      ],
      tmTitle: {
        fr: "Construire une montre automatique à l'aide de pièces détachées",
        en: "Building an automatic watch using spare parts"
      },
    },
    {
      institution: { fr: 'HEG Genève / Centre Universitaire Informatique', en: 'HEG Geneva / University IT Center' },
      degree: { fr: 'Coding Dojo – Scala & Internet des Objets (IoT)', en: 'Coding Dojo – Scala & Internet of Things (IoT)' },
      period: { fr: 'Août – Déc. 2022', en: 'Aug – Dec 2022' },
    },
    {
      institution: 'OpenClassrooms',
      degree: { fr: 'Systèmes & Réseaux, Développement, Marketing Digital', en: 'Systems & Networks, Development, Digital Marketing' },
      period: { fr: 'Juil. – Août 2023', en: 'Jul – Aug 2023' },
    },
    {
      institution: { fr: 'Club Genevois de Débat', en: 'Geneva Debate Club' },
      degree: { fr: 'Formation Oser Parler en Public', en: 'Dare to Speak in Public Training' },
      period: { fr: 'Oct. 2022', en: 'Oct 2022' },
    },
    {
      institution: 'Google Learn Digital',
      degree: { fr: 'Search Engine Optimization (SEO)', en: 'Search Engine Optimization (SEO)' },
      period: { fr: 'Août 2022', en: 'Aug 2022' },
    },
    {
      institution: 'Faclab Batelle',
      degree: { fr: 'Broderie numérique', en: 'Digital Embroidery' },
      period: { fr: 'Oct. 2022', en: 'Oct 2022' },
    },
    {
      institution: { fr: 'École Arabe de Genève', en: 'Arabic School of Geneva' },
      degree: { fr: 'Enseignement de la langue arabe', en: 'Arabic Language Education' },
      period: { fr: '2010 – 2020 (10 ans)', en: '2010 – 2020 (10 years)' },
    },
    {
      institution: { fr: 'Cycle d\'Orientation des Grandes-Communes', en: 'Grandes-Communes Secondary School' },
      degree: { fr: 'Secondaire (Cycle d\'orientation)', en: 'Secondary School' },
      period: { fr: '2017 – 2019', en: '2017 – 2019' },
    },
    {
      institution: { fr: 'École de Tivoli', en: 'Tivoli Primary School' },
      degree: { fr: 'École primaire', en: 'Primary School' },
      period: { fr: '2009 – 2017', en: '2009 – 2017' },
    },
  ],

  skills: {
    electronique_iot: {
      label: { fr: 'Électronique & IoT', en: 'Electronics & IoT' },
      items: ['Microsoudure', 'Arduino', 'Raspberry Pi', 'HomeLink', 'Serveurs NAS', 'Plex', 'Kodi'],
    },
    developpement_ia: {
      label: { fr: 'Développement & IA', en: 'Development & AI' },
      items: ['React', 'Python', 'Scala', 'HTML5/CSS3', 'Hugging Face', 'LLMs', 'Git/GitHub'],
    },
    digital_creation: {
      label: { fr: 'Digital & Création', en: 'Digital & Design' },
      items: ['SEO', 'Réseaux Sociaux', 'PAO (Vectorisation)', 'Suite Adobe', 'Inkscape', 'Rhino', 'Cura'],
    },
    systemes_reseaux: {
      label: { fr: 'Systèmes & Réseaux', en: 'Systems & Networks' },
      items: ['Windows 10', 'Linux', 'Mac', 'iOS/Android', 'Root/Jailbreak', 'Hard Reset'],
    },
    personal: {
      label: { fr: 'Compétences personnelles', en: 'Personal Skills' },
      items: [
        { fr: 'Leadership', en: 'Leadership' },
        { fr: 'Communication', en: 'Communication' },
        { fr: 'Gestion de projet', en: 'Project Management' },
        { fr: 'Relation client', en: 'Customer Relations' },
        { fr: 'Entrepreneuriat', en: 'Entrepreneurship' },
        { fr: 'Négociation', en: 'Negotiation' },
        { fr: 'Rigueur', en: 'Rigor' },
        { fr: 'Adaptabilité', en: 'Adaptability' },
        { fr: 'Esprit analytique', en: 'Analytical Thinking' },
        { fr: 'Minutie & Précision', en: 'Meticulousness & Precision' },
      ],
    },
  },

  hobbies: [
    { fr: 'Rhétorique & Débat', en: 'Rhetoric & Debate' },
    { fr: 'Impression 3D', en: '3D Printing' },
    { fr: 'Droit (Assistance à divers procès)', en: 'Law (Court attendance)' },
    { fr: 'Automatisation (HomeLink, Arduino, N8N, Make)', en: 'Automation (HomeLink, Arduino, N8N, Make)' },
  ],

  awards: [
    {
      title: { fr: '2ème Prix du meilleur discours', en: '2nd Prize for Best Speech' },
      event: { fr: 'Concours Genevois d\'Éloquence 2024', en: 'Geneva Eloquence Contest 2024' },
      date: '28 mars 2024',
      details: {
        fr: "Sujet : « Qu'importe le flacon, pourvu qu'on ait l'ivresse » – Alfred de Musset (défendu à la positive). Jury : Me Tamim Mahmoud, Me Mitra Sohrabi, M. Ziad El May.",
        en: "Topic: \"What matters the bottle, as long as we have the intoxication\" – Alfred de Musset (defended positively). Jury: Me Tamim Mahmoud, Me Mitra Sohrabi, Mr. Ziad El May."
      },
    },
    {
      title: { fr: 'Maturité gymnasiale avec mention', en: 'High School Diploma with Honors' },
      event: { fr: 'Collège Voltaire', en: 'Collège Voltaire' },
      date: '22 juin 2024',
      details: { fr: 'Moyenne générale : 5.1/6', en: 'Overall average: 5.1/6' },
    },
    {
      title: { fr: 'Meilleure note – Travail de Maturité', en: 'Top Grade – Maturity Thesis' },
      event: { fr: 'Collège Voltaire', en: 'Collège Voltaire' },
      date: '2023',
      details: {
        fr: "Note : 6.0/6 – « Construire une montre automatique à l'aide de pièces détachées »",
        en: "Grade: 6.0/6 – \"Building an automatic watch using spare parts\""
      },
    },
  ],

  associations: [
    {
      name: { fr: 'Les GEunes – Association faîtière des associations d\'élèves du Secondaire II', en: 'Les GEunes – Umbrella Association of Secondary II Student Associations' },
      role: { fr: 'Président', en: 'President' },
      period: { fr: 'Sept. 2023 – Sept. 2024', en: 'Sep 2023 – Sep 2024' },
      description: {
        fr: "Organisation du Cortège de l'Escalade (le Picoulet) et de la Soirée de la Maturité. Rencontre avec la Conseillère d'État Anne Hiltpold sur la santé mentale en milieu scolaire.",
        en: "Organization of the Escalade Procession (le Picoulet) and the Maturity Evening. Meeting with State Councillor Anne Hiltpold on mental health in schools."
      },
    },
    {
      name: { fr: 'Club Genevois de Débat', en: 'Geneva Debate Club' },
      role: { fr: 'Membre auxiliaire', en: 'Auxiliary Member' },
      period: { fr: 'Sept. 2022 – Présent', en: 'Sep 2022 – Present' },
    },
    {
      name: { fr: 'Formateur IA & Conférencier', en: 'AI Trainer & Speaker' },
      role: { fr: 'Animateur', en: 'Facilitator' },
      description: {
        fr: "Ateliers interactifs sur l'IA à Genève, 30+ participants. Thèmes : prompting, Whisper, Quillbot, Perplexity, NotebookLM, automatisation de workflows.",
        en: "Interactive AI workshops in Geneva, 30+ participants. Topics: prompting, Whisper, Quillbot, Perplexity, NotebookLM, workflow automation."
      },
    },
    {
      name: { fr: 'La Trace (Groupe Solidaire)', en: 'La Trace (Solidarity Group)' },
      role: { fr: 'Membre', en: 'Member' },
      period: { fr: 'Collège Voltaire', en: 'Collège Voltaire' },
    },
    {
      name: { fr: 'Association des Élèves du Collège Voltaire', en: 'Collège Voltaire Student Association' },
      role: { fr: 'Membre', en: 'Member' },
    },
    {
      name: { fr: 'Parlement des Jeunes Genevois', en: 'Geneva Youth Parliament' },
      role: { fr: 'Membre', en: 'Member' },
    },
  ],

  publications: [
    {
      date: '2025-10',
      title: {
        fr: "Atelier interactif sur l'Intelligence Artificielle à Genève",
        en: "Interactive Workshop on Artificial Intelligence in Geneva"
      },
      summary: {
        fr: "Animation d'un atelier IA pour ~30 participants : prompting, Whisper, Quillbot, Perplexity, NotebookLM, automatisation.",
        en: "Facilitation of an AI workshop for ~30 participants: prompting, Whisper, Quillbot, Perplexity, NotebookLM, automation."
      },
      reactions: 45,
    },
    {
      date: '2025-04',
      title: {
        fr: "Protection des données personnelles et OSINT",
        en: "Personal Data Protection and OSINT"
      },
      summary: {
        fr: "Article sur l'OSINT, les fuites de données, la surveillance numérique et la protection des données.",
        en: "Article on OSINT, data breaches, digital surveillance and data protection."
      },
      reactions: 35,
    },
  ],
};
