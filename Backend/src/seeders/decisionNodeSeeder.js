import DecisionNode from "../models/DecisionNode.js";
import Quest from "../models/Quest.js";

export const seedDecisionNodes = async () => {
  try {
    await DecisionNode.deleteMany({});

    // Get the "Death House" quest
    const deathHouseQuest = await Quest.findOne({ title: "Death House" });

    if (!deathHouseQuest) {
      console.log(
        "Death House quest not found, skipping decision node seeding",
      );
      return;
    }

    // Define nodes with connections as indices
    const nodeDefinitions = [
      // ENTRANCE & MAIN HALL (0-3)
      {
        title: "Rencontrer Rose et Thorn",
        description: "Deux enfants fantômes demandent de l'aide",
        nodeType: "event",
        nextNodes: [1],
        consequences: "Les portes claquent, message sanglant apparaît",
      },
      {
        title: "Lire le Message Sanglant",
        description: "Avertissement sur la bête et minuit",
        nodeType: "event",
        nextNodes: [2, 3],
        consequences: "L'horloge sonne 6 coups - compte à rebours commence",
      },
      {
        title: "Explorer le Rez-de-Chaussée",
        description: "Fouiller les pièces du premier étage",
        nodeType: "decision",
        nextNodes: [4, 8, 9],
        consequences: null,
      },
      {
        title: "Monter au Deuxième Étage",
        description: "Gravir l'escalier en marbre rouge",
        nodeType: "decision",
        nextNodes: [12],
        consequences: null,
      },

      // DEN OF WOLVES (4-7)
      {
        title: "Entrer dans le Repaire des Loups",
        description: "Découvrir des loups empaillés",
        nodeType: "decision",
        nextNodes: [5, 6],
        consequences: null,
      },
      {
        title: "Trouver les Jouets",
        description: "Petits loups en peluche de Rose et Thorn",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Les loups empaillés bougent quand personne ne regarde",
      },
      {
        title: "Fouiller les Armoires",
        description: "Chercher dans les armoires verrouillées",
        nodeType: "decision",
        nextNodes: [7],
        consequences: null,
      },
      {
        title: "Trouver les Carreaux Argentés",
        description: "3 carreaux d'arbalète argentés",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Armes utiles contre les créatures",
      },

      // DINING & KITCHEN (8-11)
      {
        title: "Entrer dans la Salle à Manger",
        description: "Festin animé qui devient silencieux",
        nodeType: "event",
        nextNodes: [],
        consequences: "Un festin appétissant apparaît sur la table",
      },
      {
        title: "Explorer la Cuisine",
        description: "Fouiller la cuisine bien rangée",
        nodeType: "decision",
        nextNodes: [10],
        consequences: null,
      },
      {
        title: "Découvrir le Garde-Manger Secret",
        description: "Trouver le pot en cuivre caché",
        nodeType: "decision",
        nextNodes: [11],
        consequences: null,
      },
      {
        title: "Trouver les Secrets de Klara",
        description: "Vin, dentelle, silphium et note",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Un couteau vole et se plante dans le mur",
      },

      // SECOND FLOOR - UPPER HALL (12)
      {
        title: "Arriver au Deuxième Étage",
        description: "Hall élégant avec des armures",
        nodeType: "event",
        nextNodes: [13, 17, 20, 27],
        consequences: "Courant d'air froid depuis le troisième étage",
      },

      // CONSERVATORY (13-16)
      {
        title: "Entrer dans le Conservatoire",
        description: "Musique d'un piano qui s'arrête",
        nodeType: "decision",
        nextNodes: [14],
        consequences: null,
      },
      {
        title: "Examiner le Piano",
        description: "Découvrir 'Valse pour Klara'",
        nodeType: "decision",
        nextNodes: [15],
        consequences: null,
      },
      {
        title: "Jouer la Valse pour Klara",
        description: "Interpréter la partition",
        nodeType: "decision",
        nextNodes: [16],
        consequences: null,
      },
      {
        title: "Vision Spectrale de la Danse",
        description: "Gustav danse avec Klara, Elisabeth furieuse",
        nodeType: "outcome",
        nextNodes: [19],
        consequences: "L'étagère de la bibliothèque s'ouvre",
      },

      // LIBRARY (17-19)
      {
        title: "Explorer la Bibliothèque",
        description: "Fouiller la pièce remplie de livres",
        nodeType: "decision",
        nextNodes: [18, 19],
        consequences: null,
      },
      {
        title: "Lire la Lettre de Klara",
        description: "Demande d'absence de la nourrice",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Révèle que Klara était enceinte",
      },
      {
        title: "Trouver la Porte Secrète",
        description: "Découvrir l'étagère qui pivote",
        nodeType: "decision",
        nextNodes: [24],
        consequences: null,
      },

      // MASTER SUITE (20-23)
      {
        title: "Approcher la Suite Principale",
        description: "Ombre menaçante derrière les vitraux",
        nodeType: "event",
        nextNodes: [21],
        consequences: "Terreur primordiale, puis l'ombre disparaît",
      },
      {
        title: "Entrer dans la Chambre",
        description: "Explorer la chambre poussiéreuse",
        nodeType: "decision",
        nextNodes: [22, 23],
        consequences: null,
      },
      {
        title: "Trouver l'Éclat d'Ambre",
        description: "Clé dans la boîte à bijoux",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Clé pour ouvrir la porte secrète",
      },
      {
        title: "Lire le Parchemin d'Elisabeth",
        description: "Instructions pour contrôler la Bête",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Avertissement de quitter avant minuit",
      },

      // SECRET ROOM (24-26)
      {
        title: "Ouvrir la Porte Secrète",
        description: "Utiliser l'éclat d'ambre",
        nodeType: "decision",
        nextNodes: [25],
        consequences: null,
      },
      {
        title: "Découvrir la Pièce Secrète",
        description: "Tomes sinistres et squelette",
        nodeType: "outcome",
        nextNodes: [26],
        consequences: null,
      },
      {
        title: "Lire la Lettre de Strahd",
        description: "Message cruel de Strahd aux Durst",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Révèle que Strahd méprise la famille",
      },

      // THIRD FLOOR - BALCONY (27-30)
      {
        title: "Monter au Troisième Étage",
        description: "Atteindre le balcon poussiéreux",
        nodeType: "decision",
        nextNodes: [28],
        consequences: null,
      },
      {
        title: "Combattre l'Armure Animée",
        description: "Affronter l'armure qui attaque",
        nodeType: "event",
        nextNodes: [29, 34],
        consequences: "Risque d'être poussé du balcon",
      },
      {
        title: "Entrer dans la Suite de la Nourrice",
        description: "Explorer la chambre élégante",
        nodeType: "decision",
        nextNodes: [30, 31],
        consequences: null,
      },
      {
        title: "Examiner le Miroir",
        description: "Voir l'esprit mutilé de Klara",
        nodeType: "decision",
        nextNodes: [31],
        consequences: null,
      },
      {
        title: "Communiquer avec l'Esprit",
        description: "Poser des questions à Klara",
        nodeType: "outcome",
        nextNodes: [32],
        consequences: "Elle révèle des informations par gestes",
      },

      // NURSERY (32-33)
      {
        title: "Entrer dans la Nurserie",
        description: "Découvrir le berceau de Walter",
        nodeType: "decision",
        nextNodes: [33],
        consequences: null,
      },
      {
        title: "Découvrir les Horreurs",
        description: "Doigt sectionné et runes",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Révèle la magie nécromantique sombre",
      },

      // ATTIC - CHILDREN'S ROOM (34-37)
      {
        title: "Monter au Grenier",
        description: "Atteindre le quatrième étage",
        nodeType: "decision",
        nextNodes: [35, 38, 40],
        consequences: null,
      },
      {
        title: "Entrer dans la Chambre des Enfants",
        description: "Rencontrer les fantômes de Rose et Thorn",
        nodeType: "event",
        nextNodes: [36],
        consequences: "Les enfants révèlent qu'ils sont morts",
      },
      {
        title: "Examiner la Maison de Poupée",
        description: "Étudier la réplique miniature",
        nodeType: "decision",
        nextNodes: [37],
        consequences: null,
      },
      {
        title: "Révéler l'Entrée Secrète",
        description: "Découvrir le chemin vers le sous-sol",
        nodeType: "outcome",
        nextNodes: [42],
        consequences: "Rose et Thorn demandent à être enterrés",
      },

      // ATTIC - STORAGE & SPARE (38-41)
      {
        title: "Fouiller la Chambre de Rangement",
        description: "Découvrir la malle avec le cadavre",
        nodeType: "decision",
        nextNodes: [39],
        consequences: null,
      },
      {
        title: "Trouver le Corps de Klara",
        description: "Elle est morte de faim",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "L'apparition d'Elisabeth observe",
      },
      {
        title: "Explorer la Chambre d'Amis",
        description: "Poupée et boîte à musique",
        nodeType: "decision",
        nextNodes: [41],
        consequences: null,
      },
      {
        title: "Ouvrir la Boîte à Musique",
        description: "Clé et parchemins",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Plan du donjon et liste de recrutement",
      },

      // BASEMENT - DESCENT (42-43)
      {
        title: "Descendre l'Escalier Secret",
        description: "Utiliser l'éclat d'ambre",
        nodeType: "decision",
        nextNodes: [43],
        consequences: null,
      },
      {
        title: "Entrer dans le Donjon",
        description: "Descendre dans les tunnels",
        nodeType: "event",
        nextNodes: [44],
        consequences: "Entendre des chants profonds et incessants",
      },

      // CRYPTS (44-48)
      {
        title: "Explorer les Cryptes Familiales",
        description: "Découvrir les tombes des Durst",
        nodeType: "decision",
        nextNodes: [45, 46, 47, 48, 49],
        consequences: null,
      },
      {
        title: "Entrer dans la Crypte de Walter",
        description: "Voir les kystes ensanglantés",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Entendre les plaintes d'un bébé",
      },
      {
        title: "Visiter la Crypte de Gustav",
        description: "Trouver son cercueil de pierre",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Silence lourd dans la chambre",
      },
      {
        title: "Visiter la Crypte d'Elisabeth",
        description: "Découvrir les termites mortes",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Odeur âcre de mort",
      },
      {
        title: "Trouver les Cryptes des Enfants",
        description: "Tombes de Rose et Thorn",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Les enfants veulent partir rapidement",
      },

      // CULT QUARTERS (49-53)
      {
        title: "Entrer dans les Quartiers du Culte",
        description: "Puits et alcôves",
        nodeType: "decision",
        nextNodes: [50, 52],
        consequences: null,
      },
      {
        title: "Examiner le Puits",
        description: "Voir la corde qui oscille",
        nodeType: "decision",
        nextNodes: [51],
        consequences: null,
      },
      {
        title: "Tester le Puits",
        description: "Jeter un objet dans le puits",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "L'objet est déchiré par une force invisible",
      },
      {
        title: "Fouiller les Chambres",
        description: "Explorer les alcôves des cultistes",
        nodeType: "decision",
        nextNodes: [53],
        consequences: null,
      },
      {
        title: "Trouver le Journal de Drasha",
        description: "Liste des sacrifices",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Détails horribles: 'Nourri à Walter'",
      },

      // DINING HALL & LARDER (54-56)
      {
        title: "Entrer dans la Salle à Manger",
        description: "Ossements humains éparpillés",
        nodeType: "event",
        nextNodes: [55],
        consequences: "Odeur de pourriture et de sang",
      },
      {
        title: "Explorer le Garde-Manger",
        description: "Entrer dans l'alcôve sombre",
        nodeType: "decision",
        nextNodes: [56],
        consequences: null,
      },
      {
        title: "Combattre le Grick",
        description: "Affronter les restes de Gustav",
        nodeType: "event",
        nextNodes: [57],
        consequences: "Créature horrifique avec dents humaines",
      },

      // GHOUL ENCOUNTER (57-58)
      {
        title: "Traverser le Couloir Maudit",
        description: "Tunnel taché de sang",
        nodeType: "decision",
        nextNodes: [58],
        consequences: null,
      },
      {
        title: "Combattre les Goules",
        description: "Affronter les cultistes transformés",
        nodeType: "event",
        nextNodes: [59],
        consequences: "Elles répètent: 'Nous sommes parfaits'",
      },

      // RELIQUARY & ALTAR (59-65)
      {
        title: "Entrer dans le Reliquaire",
        description: "Alcôves avec reliques",
        nodeType: "decision",
        nextNodes: [60, 63, 66],
        consequences: null,
      },
      {
        title: "Approcher l'Autel de Strahd",
        description: "Statue avec l'orbe de cristal",
        nodeType: "decision",
        nextNodes: [61],
        consequences: null,
      },
      {
        title: "Toucher l'Orbe",
        description: "Sentir le mal ancien",
        nodeType: "decision",
        nextNodes: [62],
        consequences: null,
      },
      {
        title: "Combattre les Ombres",
        description: "Affronter les ombres éveillées",
        nodeType: "event",
        nextNodes: [],
        consequences: "Elles murmurent: 'Rendez l'offrande!'",
      },

      // CULT LEADER QUARTERS (63-65)
      {
        title: "Explorer la Zone du Chef",
        description: "Quartiers privés",
        nodeType: "decision",
        nextNodes: [64],
        consequences: null,
      },
      {
        title: "Fouiller la Chambre",
        description: "Ouvrir le coffre au pied du lit",
        nodeType: "decision",
        nextNodes: [65],
        consequences: null,
      },
      {
        title: "Combattre le Boneless",
        description: "Affronter la peau de Gustav",
        nodeType: "event",
        nextNodes: [],
        consequences: "Créature faite de peau écorchée",
      },

      // RITUAL CHAMBER (66-74)
      {
        title: "Descendre vers la Chambre Rituelle",
        description: "Suivre les chants",
        nodeType: "decision",
        nextNodes: [67],
        consequences: null,
      },
      {
        title: "Traverser le Portcullis",
        description: "Ouvrir ou lever la herse",
        nodeType: "decision",
        nextNodes: [68],
        consequences: null,
      },
      {
        title: "Entrer dans la Chambre Rituelle",
        description: "Voir l'autel et l'amas de chair",
        nodeType: "event",
        nextNodes: [69],
        consequences: "Les chants s'arrêtent soudainement",
      },
      {
        title: "Examiner l'Autel",
        description: "'NOURRISSEZ-LE' gravé sur la pierre",
        nodeType: "decision",
        nextNodes: [70, 72],
        consequences: null,
      },
      {
        title: "Sacrifier une Créature",
        description: "Offrir un sacrifice à l'amas",
        nodeType: "decision",
        nextNodes: [71],
        consequences: null,
      },
      {
        title: "Sacrifice Accepté",
        description: "L'amas dévore l'offrande",
        nodeType: "outcome",
        nextNodes: [72],
        consequences: "Sa faim ne peut être apaisée",
      },
      {
        title: "Attaquer l'Amas de Chair",
        description: "Combattre les restes de Walter",
        nodeType: "decision",
        nextNodes: [73],
        consequences: null,
      },
      {
        title: "Combattre l'Amas de Chair",
        description: "Affronter la créature éveillée",
        nodeType: "event",
        nextNodes: [74],
        consequences: "Son cri fait trembler la terre",
      },
      {
        title: "Vaincre l'Amas de Chair",
        description: "Détruire la créature",
        nodeType: "outcome",
        nextNodes: [75],
        consequences: "La porte d'entrée s'ouvre au-dessus",
      },

      // ESCAPE (75-82)
      {
        title: "Commencer l'Évasion",
        description: "L'esprit d'Elisabeth apparaît",
        nodeType: "event",
        nextNodes: [76],
        consequences: "Elle jure de détruire la maison",
      },
      {
        title: "Fuir la Maison qui s'Effondre",
        description: "Courir vers la sortie",
        nodeType: "decision",
        nextNodes: [77],
        consequences: null,
      },
      {
        title: "Affronter le Fantôme de Gustav",
        description: "Gustav supplie de rester",
        nodeType: "event",
        nextNodes: [78, 79],
        consequences: null,
      },
      {
        title: "Convaincre Gustav",
        description: "Persuader Gustav de s'écarter",
        nodeType: "decision",
        nextNodes: [80],
        consequences: null,
      },
      {
        title: "Combattre Gustav",
        description: "Affronter le poltergeist",
        nodeType: "decision",
        nextNodes: [80],
        consequences: null,
      },
      {
        title: "Traverser les Esprits du Culte",
        description: "Passer les 13 apparitions",
        nodeType: "event",
        nextNodes: [81],
        consequences: "Illusions qui font tomber des débris",
      },
      {
        title: "Échapper à la Maison",
        description: "Sortir avant l'effondrement",
        nodeType: "outcome",
        nextNodes: [82],
        consequences: "Vous vous retrouvez sur l'Ancienne Route de Svalich",
      },
      {
        title: "Enterrer Rose et Thorn",
        description: "Donner la paix aux enfants",
        nodeType: "outcome",
        nextNodes: [],
        consequences: "Les esprits vous remercient et disparaissent",
      },
    ];

    // Add questId to all nodes and convert nextNodes indices to empty arrays
    const nodes = nodeDefinitions.map((node) => ({
      ...node,
      questId: deathHouseQuest._id,
      nextNodes: [], // Will be populated after insertion
    }));

    const createdNodes = await DecisionNode.insertMany(nodes);

    // Now update all connections using the indices from nodeDefinitions
    for (let i = 0; i < nodeDefinitions.length; i++) {
      if (nodeDefinitions[i].nextNodes.length > 0) {
        await DecisionNode.findByIdAndUpdate(createdNodes[i]._id, {
          nextNodes: nodeDefinitions[i].nextNodes.map(
            (index) => createdNodes[index]._id,
          ),
        });
      }
    }

    console.log("Decision nodes seeded successfully");
    return createdNodes;
  } catch (error) {
    console.error("Error seeding decision nodes:", error);
    throw error;
  }
};
