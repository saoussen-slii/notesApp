# Notes

Application de prise de notes composée d'une interface React et d'une API Express. Les notes sont enregistrées dans le fichier `notes-backend/db.json`.

## Prérequis

- Node.js et npm

## Lancer le projet

Ouvrez deux terminaux à la racine du projet.

Dans le premier, démarrez le backend :

```powershell
cd notes-backend
npm install
node server.js
```

L'API démarre à l'adresse `http://localhost:3001`.

Dans le second, démarrez le frontend :

```powershell
cd notes-frontend
npm install
npm run dev
```

Ouvrez ensuite l'adresse locale indiquée par Vite dans le terminal.

## Structure

- `notes-frontend/` : interface React, TypeScript et Vite.
- `notes-backend/` : API REST Express et stockage des notes dans `db.json`.

Consultez les README de chaque dossier pour plus de détails :

- [Frontend](./notes-frontend/README.md)
- [Backend](./notes-backend/README.md)
