# Faya Cartes — version sans Termux

Cette version utilise une fonction serverless Vercel. Tu n'as pas besoin de lancer un serveur sur ton téléphone.

## Ce que tu fais

1. Crée un projet Vercel et importe ce dossier/repository.
2. Dans Vercel : **Project Settings → Environment Variables**
3. Ajoute :
   - `OPENAI_API_KEY` = ta nouvelle clé OpenAI
   - `OPENAI_IMAGE_MODEL` = `gpt-image-2`
4. Redéploie.
5. Ouvre ton site et clique sur **Générer ma carte**.

La clé OpenAI n'est jamais envoyée au navigateur : elle reste côté serveur dans la variable Vercel.

## Important

La clé qui avait été montrée dans une capture d'écran doit être révoquée. Crée une nouvelle clé et ajoute uniquement la nouvelle clé dans Vercel.

## Structure

- `public/` : le site Faya Cartes
- `api/generate.js` : fonction serverless sécurisée qui appelle OpenAI
- `vercel.json` : configuration Vercel

## Modèle image

Le projet utilise `gpt-image-2`, qui est actuellement un modèle de génération d'images OpenAI.

## Déploiement

Le plus simple depuis un téléphone :
- mets le dossier dans un dépôt GitHub,
- sur Vercel choisis **Add New → Project**,
- importe le dépôt,
- ajoute les deux variables d'environnement,
- clique sur **Deploy**.

Aucun Termux, Python, pip ou serveur local n'est nécessaire.
