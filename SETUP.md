# Setup

How to install and run the calculator on your own computer.

## What you need

- **Node.js 22.22.2 or newer.** Node 24 LTS is recommended and is what the project is tested with
  (see `.nvmrc`). Download it from https://nodejs.org or install it with a version manager such as `nvm`.
- **npm**, which is installed with Node.js.
- A modern web browser (Chrome, Firefox, Safari, or Edge).

Check your versions:

```bash
node --version    # v22.22.2 or newer
npm --version
```

## Install and run

Get the code and move into the project folder:

```bash
git clone https://git.doit.wisc.edu/smph-public/department-of-family-medicine-and-community-health/pro-health-calc.git
cd pro-health-calc
```

Then install and start it:

```bash
npm install       # downloads the dependencies (once)
npm run dev       # starts the calculator
```

Open http://localhost:3000 in your browser. The page reloads automatically when you edit a source file.
Press `Ctrl+C` in the terminal to stop it.

## Build a production copy

```bash
npm run build     # writes the optimized site to the dist/ folder
npm run preview   # serves the dist/ folder at http://localhost:3000
```

The `dist/` folder is a static website. It can be hosted by any web server.

## npm scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Create the production site in `dist/` |
| `npm run preview` | Serve the production site locally |
| `npm test` | Run all tests once and write the test report |
| `npm run test:watch` | Re-run tests whenever a file changes |

## Troubleshooting

- **`npm install` fails with an error mentioning `edgesOut`, or warns about "Unsupported engine".** Your Node.js
  version is too old or is an odd-numbered (non-LTS) release. Install Node 24 LTS.
- **Port 3000 is already in use.** Stop the other program, or change `server.port` in `vite.config.js`.
- **The page is blank.** Open the browser's developer console (F12) and check for errors. Confirm that
  `npm run dev` is still running.

## Configuration

The calculator needs no environment variables, API keys, or accounts.
