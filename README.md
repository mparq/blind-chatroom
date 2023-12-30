# Blind chatroom app

This is a dead simple chatroom app where everyone who joins sends a message and nobody is identifiable. No usernames here. For use with the sibs when playing "A Game of Things" :)

## Dev environment setup

Either:
- install node v18
- install deps and run npm start (or `node server.js`)

Or, just use the dev container setup: VS Code Dev Containers extensions, Docker runtime on your computer and you're good to go.

Or, you can use github's codespaces.

Either way, the server is a simple nodeJS server, locally running on port 3000. `server.js` is the backend. Frontend code is whatever's in `public/`. `app.js` has client-side javascript logic.

In a terminal, run the following and follow normal webdev loop

```sh
npm i
# start local server
npm start
```

