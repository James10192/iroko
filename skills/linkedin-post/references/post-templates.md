# Templates de Posts LinkedIn

IMPORTANT : Ne JAMAIS utiliser le meme template 2 fois de suite. Varier les formats pour que le feed reste frais. Chaque template a un "vibe" different — choisir celui qui colle le mieux au sujet.

---

## Template 1 : "Le probleme que personne ne voit"

Angle : Montrer un probleme cache dans un systeme qui "marche" et comment on l'a resolu.

```
[Phrase choc : "Ca marchait. Mais c'etait une bombe a retardement."]

[Description du probleme — pourquoi il etait invisible]

[Le moment ou ca a pete / ou on l'a vu]

[La solution — technique mais digestible]

[La lecon : pourquoi ce pattern est dangereux]

#hashtags
```

**Exemple :**
```
Un controller de 5490 lignes. Ca compilait. Les tests passaient. Personne n'y touchait.

Sur KLASSCI, notre SaaS de gestion scolaire utilise par 5 etablissements en Cote d'Ivoire, le ESBTPBulletinController etait devenu un monolithe que tout le monde evitait.

Le vrai probleme ? Chaque bug fix risquait de casser les bulletins de 3000 etudiants en prod. Personne n'osait refactorer.

On l'a split en 4 controllers + 2 services dedies. Le plus dur n'etait pas le code — c'etait de garantir zero regression sur 5 tenants en parallele.

Le signe qu'un fichier a besoin de refactoring, c'est quand l'equipe le contourne au lieu de le modifier.

#Laravel #Refactoring #SaaS #PHP #EdTech
```

---

## Template 2 : "Avant / Apres" (transformation visuelle)

Angle : Contraste brutal entre l'etat avant et apres. Fonctionne bien pour du UI/UX ou du refactoring.

```
Avant : [etat initial en 1 ligne]
Apres : [etat final en 1 ligne]

[Context : pourquoi c'etait comme ca]

[Ce qu'on a change — 3-4 points concrets]

[Impact mesurable]

#hashtags
```

---

## Template 3 : "Le choix contre-intuitif"

Angle : Un choix technique qui semble mauvais mais qui etait le bon dans ce contexte.

```
[Affirmation provocante : "On a choisi [option impopulaire]. Et c'etait la bonne decision."]

[Le contexte qui rend ce choix logique]

[Ce qu'on a gagne vs ce qu'on a sacrifie]

[Retour d'experience apres N mois]

[Question : "Vous auriez fait quoi ?"]

#hashtags
```

**Exemple :**
```
On a integre un chatbot IA dans un SaaS scolaire. Pas pour le hype — par necessite.

Les secretaires de nos 5 etablissements passaient des heures a chercher les memes infos : "ou en est le paiement de tel etudiant ?", "combien d'absences ce mois-ci ?"

Claude Haiku 4.5, 19 tools, SSE streaming. Le bot interroge directement la BDD et repond en 2 secondes.

Le plus contre-intuitif ? On n'a PAS utilise RAG. Avec un schema strict et des outils bien definis, le tool calling direct est plus fiable qu'un systeme de retrieval.

Est-ce que RAG est vraiment necessaire pour vos cas d'usage, ou c'est devenu un reflexe automatique ?

#AI #Claude #Laravel #SaaS #ToolCalling
```

---

## Template 4 : "Le bug a 3h du mat'"

Angle : Storytelling autour d'un bug memorable. Tension narrative.

```
[Situation : le contexte quand ca a casse]

[Premier reflexe : ce qu'on pensait]

[Le plot twist : la vraie cause]

[Le fix en 1-3 lignes]

[Ce que ca m'a appris sur [concept plus large]]

#hashtags
```

**Exemple :**
```
Les bulletins de 300 etudiants affichaient des moyennes a 0.00. En prod.

Premier reflexe : un bug dans le calcul des moyennes. J'ai verifie. Le service de calcul etait correct.

Le probleme ? Le format de la periode. Le frontend envoyait "S1" mais la BDD stockait "Semestre 1". Une simple comparaison de strings.

Le fix : 3 lignes. Une fonction getPeriodeVariants() qui normalise les formats.

Les bugs les plus stressants sont rarement les plus complexes. C'est souvent un mismatch de conventions que personne n'a documente.

#Debugging #Laravel #PHP #SaaS
```

---

## Template 5 : "Ce que j'ai appris en construisant X"

Angle : Post reflexif apres un milestone. Partage de sagesse, pas de flex.

```
[Milestone : "X mois / X users / X lignes plus tard"]

[3 lecons numerotees — chacune en 2 lignes max]

[La lecon bonus — celle qu'on decouvre seulement avec le recul]

[Question ouverte]

#hashtags
```

---

## Template 6 : "La stack inattendue" (contexte africain)

Angle : Montrer comment le contexte local influence les choix techniques. Tres differenciateur sur LinkedIn.

```
[Contexte local qui surprend : "En Cote d'Ivoire, [realite terrain]"]

[Comment ca change l'approche technique]

[La solution adaptee]

[Pourquoi les solutions "standard" ne marchent pas ici]

[Ouverture sur l'innovation en Afrique]

#hashtags
```

**Exemple :**
```
En Cote d'Ivoire, beaucoup de transactions passent par Wave et Orange Money, pas par carte bancaire.

Pour E-pagne, notre app de gestion de finances personnelles, la notion de "compte bancaire" classique ne suffisait pas. Il fallait modeliser Wave, Orange Money, MTN Money, Moov Money et le cash physique comme des comptes a part entiere.

Next.js 16 + Convex en serverless, deploy sur Vercel. Une PWA qui tourne aussi bien sur un Samsung a 50 000 FCFA que sur un iPhone.

Les apps de fintech US partent du principe que tout le monde a un compte bancaire. En Afrique de l'Ouest, on construit la couche en dessous.

#Fintech #Africa #NextJS #PWA #MobileMoney
```

---

## Template 7 : "Thread technique" (educational)

Angle : Mini-tutoriel base sur un vrai probleme resolu. Apporte de la valeur directe.

```
[Probleme generique que d'autres devs rencontrent]

Voici comment on l'a resolu sur [projet] :

1. [Etape 1 — avec code/config si pertinent]
2. [Etape 2]
3. [Etape 3]

Le piege a eviter : [gotcha]

[Lien vers doc/repo si pertinent]

#hashtags
```

---

## Template 8 : "Les chiffres parlent"

Angle : Post centre sur des metriques. Laisse les donnees raconter l'histoire.

```
[Chiffre marquant en ouverture]

→ [Chiffre 1] : [contexte]
→ [Chiffre 2] : [contexte]
→ [Chiffre 3] : [contexte]

[Ce que ces chiffres revelent — l'insight]

[Ce qui vient ensuite]

#hashtags
```

---

## Template 9 : "L'outil que j'aurais voulu connaitre avant"

Angle : Partage d'outil/technique/pattern avec vecu personnel. Fort taux d'engagement.

```
[Frustration passee : "Pendant X mois, je faisais [truc penible]"]

Puis j'ai decouvert [outil/pattern/technique].

[Comment ca change le workflow — concret, pas vague]

[Avant/Apres en termes de temps ou d'effort]

Si vous travaillez avec [techno], essayez ca.

#hashtags
```

---

## Template 10 : "Question ouverte" (engagement max)

Angle : Poser une vraie question basee sur un dilemme reel. Le post le plus court mais souvent le plus engage.

```
[Dilemme en 2-3 phrases]

[Les 2 options avec leurs tradeoffs en 1 ligne chacune]

Personnellement, j'ai choisi [option] sur [projet] parce que [raison].

Et vous, vous faites comment ?

#hashtags
```

---

## Regles de formatage LinkedIn

- **Longueur** : 800-1500 caracteres ideal (visible sans "voir plus" : ~210 chars)
- **Accroche** : Les 2 premieres lignes sont CRITIQUES — c'est ce qui decide si les gens cliquent "voir plus"
- **Paragraphes** : Courts (2-3 lignes max), separes par une ligne vide
- **Listes** : Tirets ou fleches (→), pas de bullets Unicode complexes
- **Hashtags** : 3-5, en fin de post. Mix de gros (#Laravel, #NextJS, #AI) et niche (#EdTech, #MobileMoney, #SaaS)
- **Call to action** : UNE SEULE question ouverte emotionnelle en fin — pas un QCM, pas "likez si vous etes d'accord", mais une question qui touche et fait reflechir tout le monde (pas juste les devs)
- **Langue** : Francais par defaut. Anglais si le sujet touche une audience internationale (IA, open source, DevOps)
- **Pas de** : "Thrilled to announce", "I'm excited to share", "Petit thread sur...", emojis excessifs
- **Pas de tiret long (em dash "—")** : c'est une convention anglophone, pas francaise. En francais ca fait artificiel et "genere par IA". Alternatives naturelles :
  - Virgule simple pour les incises : "J'ai lance KALGA, une revolution dans le secteur"
  - Point + nouvelle phrase pour les pauses : "J'ai lance KALGA. Les resultats parlent d'eux-memes."
  - Deux-points pour introduire une explication : "Le signal est clair : l'IA en Afrique n'est plus experimentale"
  - Connecteurs logiques naturels : "mais", "et", "donc", "car", "cependant", "en revanche"
  - JAMAIS "X — Y" ni "X — Y — Z" dans un post ou un commentaire

## Regles de ton et posture (CRITIQUES)

- **JAMAIS condescendant** envers les utilisateurs — ne jamais pointer les limites des gens (illettres, analphabetes, "ne savent pas utiliser la tech"). Toujours valoriser l'intelligence du choix technique, pas les faiblesses du public cible
- **Pas de QCM / quiz multi-questions** — ca fait artificiel et force. Si on veut de l'engagement, UNE seule question ouverte emotionnelle vaut 10x plus qu'un quiz a choix multiples
- **Le storytelling > le pedagogique** — raconter le probleme humain d'abord, la solution technique ensuite. Le lecteur doit ressentir avant de comprendre
- **Chaque argument doit tenir** — si une reponse a un QCM peut etre contestee ("on peut faire du vocal dans une app aussi"), la question est mauvaise. Toujours se demander : "est-ce que quelqu'un peut me contredire facilement ?"
- **Framing positif** — "le vocal c'est naturel" plutot que "les gens ne savent pas ecrire". "Zero friction d'acquisition" plutot que "les utilisateurs sont limites"
- **Inclure tout le monde** — la question finale doit permettre a n'importe qui de repondre (dev, entrepreneur, diaspora, militant), pas juste les techniciens

## Orthographe et grammaire francaise (OBLIGATOIRE)

Les posts LinkedIn DOIVENT avoir une orthographe et grammaire impeccables. La credibilite professionnelle en depend. Regles a appliquer systematiquement :

### Accents obligatoires
- **e accent aigu (é)** : tous les participes passes (encouragé, utilisé, créé, lancé), mots courants (équipe, développeur, résultat, réalité, général)
- **e accent grave (è)** : très, près, mère, père, première, dernière
- **a accent grave (à)** : preposition "à" (aller à, grâce à, destiné à). Test : remplacer par "avait", si ca marche c'est "a" sans accent
- **u accent grave (ù)** : uniquement dans "où" (lieu/moment)
- **c cedille (ç)** : ça, français, façon, reçu, leçon

### Homophones critiques
- **là** (lieu/moment) vs **la** (article) : "c'est là que tout commence" vs "la maison"
- **à** (preposition) vs **a** (verbe avoir) : "il a réussi à convaincre"
- **où** (lieu) vs **ou** (choix) : "où tu vas" vs "Python ou JavaScript"
- **c'est** (cela est) vs **s'est** (reflexif) vs **ces** (demonstratif) vs **ses** (possessif)

### Participes passes (-é vs -er)
- Apres avoir/etre : participe passe (-é) : "j'ai lancé", "il est arrivé"
- Apres vouloir/pouvoir/devoir/aller : infinitif (-er) : "je veux lancer", "il va arriver"
- **Test de substitution** : remplacer par "vendre/vendu". "J'ai vendu" = "j'ai lancé". "Je veux vendre" = "je veux lancer"

### Accords
- Avec etre : accord avec le sujet ("elle est arrivée", "ils sont partis")
- Avec avoir : accord avec le COD s'il est AVANT le verbe ("les projets que j'ai menés")
- Pluriel apres les/des/ces/ses : toujours ("les solutions", pas "les solution")

### Checklist avant publication
1. Tous les "e" prononces "é" ont leur accent aigu ?
2. "à" vs "a", "là" vs "la", "où" vs "ou" corrects ?
3. Participes passes accordes ?
4. -er vs -é : test de substitution fait ?
5. Ça (et non "ca"), français (et non "francais") ?

## Selection du template

| Situation | Templates recommandes |
|-----------|----------------------|
| Nouvelle feature implementee | 1, 2, 5 |
| Bug resolu | 4, 7 |
| Choix d'architecture | 3, 10 |
| Milestone projet | 5, 8 |
| Contexte Afrique/local | 6 |
| Pattern/technique utile | 7, 9 |
| Reflexion generale | 3, 10 |
| Premiere fois avec une techno | 9 |
