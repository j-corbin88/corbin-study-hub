# Corbin Study Hub

A static, no-build study site for the kids. Pick a kid (top right), pick a subject (left pane), then use flashcards, a quiz, or a printable word list.

## Adding content
- Each kid has a file at `data/<id>.js` (see `data/cole.js`). Add a new study set to the top of the subject's list.
- Kids and subjects are defined in `data/profiles.js`.
- Push to `main` and Netlify redeploys automatically.
