# GUIDE DE DÉPLOIEMENT — DOLY Exam Platform
## Durée estimée : 20 minutes

---

## ÉTAPE 1 — Créer un compte Supabase
1. Va sur https://supabase.com → "Start your project" → compte gratuit
2. Clique "New project"
   - Nom : `doly-exam`
   - Mot de passe DB : note-le quelque part
   - Région : **West EU (Ireland)**
3. Attends 2 minutes que le projet se crée

---

## ÉTAPE 2 — Configurer la base de données
1. Dans ton projet Supabase, menu gauche → **SQL Editor**
2. Clique "New query"
3. Copie-colle **tout le contenu** du fichier `supabase_setup.sql`
4. Clique **Run** (bouton vert)
5. Tu dois voir "Success" → les tables et comptes sont créés

---

## ÉTAPE 3 — Récupérer tes clés Supabase
1. Menu gauche → **Settings** → **API**
2. Note :
   - **Project URL** → ressemble à `https://abcdefghij.supabase.co`
   - **anon public key** → longue chaîne de caractères

---

## ÉTAPE 4 — Créer un compte Vercel
1. Va sur https://vercel.com → compte gratuit (connecte avec GitHub)
2. Installe Git si ce n'est pas fait : https://git-scm.com

---

## ÉTAPE 5 — Préparer les fichiers
1. Crée un dossier `doly-exam` sur ton bureau
2. Copie tous les fichiers du projet dedans
3. Dans ce dossier, crée un fichier `.env` (pas `.env.example`, `.env`) :
```
REACT_APP_SUPABASE_URL=https://VOTRE_ID.supabase.co
REACT_APP_SUPABASE_ANON_KEY=VOTRE_ANON_KEY
```
   Remplace avec tes vraies valeurs de l'étape 3

---

## ÉTAPE 6 — Pousser sur GitHub
```bash
cd doly-exam
git init
git add .
git commit -m "DOLY exam platform"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/doly-exam.git
git push -u origin main
```
*(Crée d'abord le repo sur github.com → "New repository" → "doly-exam")*

---

## ÉTAPE 7 — Déployer sur Vercel
1. Sur vercel.com → "Add New Project"
2. Sélectionne ton repo `doly-exam`
3. **Important** : avant de déployer, clique "Environment Variables"
4. Ajoute :
   - `REACT_APP_SUPABASE_URL` = ta valeur
   - `REACT_APP_SUPABASE_ANON_KEY` = ta valeur
5. Clique "Deploy"
6. Attends 2-3 minutes → tu obtiens une URL type `doly-exam.vercel.app`

---

## ÉTAPE 8 — Activer le Realtime Supabase
1. Dans Supabase → menu gauche → **Database** → **Replication**
2. Active le realtime pour les tables :
   - `batches`
   - `candidates`
3. Clique Save

---

## ÉTAPE 9 — Tester
1. Ouvre ton URL Vercel dans Chrome
2. Connecte-toi en formateur : `formateur` / `D0LyMaT3UR_`
3. Crée un batch "Test"
4. Ouvre un autre onglet → candidat → entre un nom → sélectionne le batch
5. En formateur → lance l'examen → le candidat doit démarrer automatiquement ✓

---

## ÉTAPE 10 — URL à communiquer
```
https://doly-exam.vercel.app
```
Donne cette URL à tous les candidats et staff. Fonctionne sur PC, Mac, tablette.

---

## COMPTES
| Rôle | Identifiant | Mot de passe |
|------|------------|-------------|
| Formateur | `formateur` | `D0LyMaT3UR_` |
| Directeur | `directeur` | `@dIR3CT3UR_!` |

---

## POUR CHANGER UN MOT DE PASSE
Dans Supabase SQL Editor, exécute :
```sql
update staff_accounts 
set password_hash = '$2a$10$NOUVEAU_HASH'
where username = 'formateur';
```
Pour générer un nouveau hash : https://bcrypt-generator.com (rounds = 10)

---

## EN CAS DE PROBLÈME
- Page blanche → vérifier les variables d'environnement dans Vercel
- Erreur de connexion → vérifier que le SQL a bien été exécuté dans Supabase
- Realtime ne fonctionne pas → vérifier l'étape 8 (Replication)
