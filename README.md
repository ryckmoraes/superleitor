
# Welcome to SuperLeitor

## Project info

**URL**: https://lovable.dev/projects/61c9c85a-521b-4753-a60e-0cdb64c7b0cc

## APK Download

An Android APK is built automatically when changes are pushed to the main branch. You can download the latest APK by:

1. Going to the GitHub repository's Actions tab
2. Clicking on the latest workflow run
3. Scrolling to the Artifacts section
4. Downloading the "esfera-sonora-app" artifact

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/61c9c85a-521b-4753-a60e-0cdb64c7b0cc) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i --legacy-peer-deps

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Important: Dependency Management

This project includes a dependency conflict between `react-day-picker` (which requires `date-fns` v2.x or v3.x) and the latest `date-fns` v4.x. 
We've downgraded `date-fns` to v3.x to resolve this conflict. Always use `--legacy-peer-deps` when installing new packages.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/61c9c85a-521b-4753-a60e-0cdb64c7b0cc) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
