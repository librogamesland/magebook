# Magebook web editor
A web editor for gamebook writing. Try last version here: [https://magebook.github.io](https://magebook.github.io)


<img src="https://librogamesland.github.io/magebook/docs/screenshots/1.jpg" alt="magebook screenshot" style="max-width:100%;">



## Usage guide

This file is intended for developer who wants to contribute to Magebook. If you are an user or a write, check the [official guide instead](https://librogamesland.github.io/magebook).

If you are looking for the API or the command line converter, check the [API documentation](https://www.npmjs.com/package/magebook).

## Getting started

Make sure to have git and Node.js installed on your system.

First of all, clone the project from github:
```bash
git clone https://github.com/librogamesland/magebook.git
cd magebook  # move inside the directory
```


Setup dependencies.

Optional: keep in mind that we use google chrome to test components. You may skip chrome download and use your local chrome by exporting the following env vars:
```bash
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```
(replace `/usr/bin/google-chrome` with your local path, on linux you may find it with `whereis google-chrome`)

Finally, install dependencies with:

```
npm i
```


Now you may run:
```bash
npm run dev        # start magebook locally with live reload on save
npm run build      # prepare for deployment
npm run preview    # check if the built version works as expected


npm run docs       # start docs server
npm run test       # run tests (you need to export PUPPETEER_EXECUTABLE_PATH again)
```

### Deploy on firebase

As explained here: <https://medium.com/@prathampoddar01/deploying-a-vite-app-with-firebase-a-beginners-overview-c4064959353a>

```bash
npm install -g firebase-tools

firebase login
firebase init hosting

# And after npm run build
cd editor
firebase deploy

```

