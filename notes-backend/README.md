# Backend

API REST Express pour créer, consulter, modifier et supprimer des notes. Les données sont conservées dans `db.json`.

## Démarrage

Depuis ce dossier :

```powershell
npm install
node server.js
```

Le serveur écoute sur `http://localhost:3001`. Le frontend utilise cette adresse directement.

## Routes

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/notes` | Retourne toutes les notes. |
| `POST` | `/notes` | Crée une note avec `content` (chaîne) et, facultativement, `important` (booléen, par défaut `false`). |
| `PUT` | `/notes/:id` | Modifie une note avec `content` (chaîne) et `important` (booléen). |
| `DELETE` | `/notes/:id` | Supprime une note. |

Une note a la forme suivante :

```json
{
  "id": 123,
  "content": "Exemple de note",
  "important": false
}
```
