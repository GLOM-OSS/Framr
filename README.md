# Framr

Framr is a powerful web application for generating and managing framesets, rules, and tools. It provides a flexible and intuitive interface for creating complex data structures and configurations. The application is built with Next.js, React, and TypeScript, and it uses Material-UI for the user interface.

## About

Framr is designed to streamline the process of creating and managing framesets. It provides a visual interface for building complex data structures, and it allows you to define rules and constraints to ensure data integrity. The application is highly extensible, and it can be customized to meet the specific needs of your project.

## Features

- **Frame Generator**: A visual tool for creating and managing framesets.
- **Rule Management**: Define rules and constraints to ensure data integrity.
- **Tool Management**: Manage and configure tools for use in the Frame Generator.
- **Extensible**: The application is highly extensible and can be customized to meet the specific needs of your project.

## Getting Started

To get started with the development server, run the following command:

```bash
nx serve framr-web
```

Open your browser and navigate to http://localhost:4200/.

## Project Structure

The project is organized into two main directories: `apps` and `libs`.

- `apps`: Contains the main application code.
  - `framr-web`: The main web application.
    - `lib`: Contains the core logic of the application.
      - `constants`: Application-wide constants.
      - `hooks`: Custom React hooks.
      - `layouts`: Application layouts.
      - `modules`: Different modules of the application (e.g., FrameGenerator, rules, services).
      - `services`: Services for interacting with APIs or data sources.
      - `theme`: Theme configuration for Material-UI.
      - `types`: TypeScript type definitions.
    - `pages`: Next.js pages.
    - `public`: Static assets.
- `libs`: Contains reusable libraries and modules that can be shared across different applications.

## Dependencies

The project uses the following main dependencies:

- Next.js: A React framework for building server-side rendered and statically generated web applications.
- React: A JavaScript library for building user interfaces.
- TypeScript: A typed superset of JavaScript that compiles to plain JavaScript.
- Material-UI: A popular React UI framework that provides a set of customizable components.
- Emotion: A library for writing CSS styles with JavaScript.
- Nx: A set of extensible developer tools for monorepos.

## Available Scripts

In the project directory, you can run the following scripts:

- `nx serve framr-web`: Starts the development server.
- `nx build framr-web`: Builds the application for production.
- `nx test framr-web`: Runs the unit tests.

## Learn More

To learn more about the technologies used in this project, see the following resources:

- [Nx Documentation](https://nx.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Material-UI Documentation](https://mui.com/getting-started/usage/)
- [Emotion Documentation](https://emotion.sh/docs/introduction)