Changify
========

Changify is a web application built with Next.js, TypeScript, and Tailwind CSS, designed to support NGOs and charitable organizations in managing campaigns and facilitating public donations. The platform provides a user-friendly interface for creating, showcasing, and managing fundraising campaigns, enabling donors to contribute seamlessly and securely.

Features
--------

*   **User Authentication**: Secure user login and registration system.
    
*   **Profile Management**: Users can view and update their profile information.
    
*   **Change Verification**: Implements a verification process for sensitive data changes.
    
*   **Responsive Design**: Optimized for various devices using Tailwind CSS.
    
*   **Modern Stack**: Built with Next.js, TypeScript, Prisma, and Tailwind CSS.
    

Technologies Used
-----------------

*   [Next.js](https://nextjs.org/): React framework for server-rendered applications.
    
*   [TypeScript](https://www.typescriptlang.org/): Typed superset of JavaScript.
    
*   [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework.
    
*   [Prisma](https://www.prisma.io/): Next-generation ORM for Node.js and TypeScript.
    
*   [React Hooks](https://reactjs.org/docs/hooks-intro.html): For managing component state and side effects.
    

Getting Started
---------------

### Prerequisites

*   Node.js (v14 or later)
    
*   npm or yarn
    
*   PostgreSQL (or any other supported database)
    

### Installation

1.  git clone https://github.com/Code-By-Tom2/changify.git
    
2.  Using npm:npm installOr using yarn:yarn install
    
3.  Create a .env file in the root directory and add the following:DATABASE\_URL=your\_database\_connection\_stringNEXTAUTH\_SECRET=your\_nextauth\_secret
    
4.  npx prisma migrate dev --name init
    
5.  Using npm:npm run devOr using yarn:yarn devThe application will be available at [http://localhost:3000](http://localhost:3000/).
    

Project Structure
-----------------

*   app/: Contains the main application components and pages.
    
*   components/: Reusable UI components.
    
*   data/: Static data and constants.
    
*   hooks/: Custom React hooks.
    
*   lib/: Utility functions and helpers.
    
*   prisma/: Prisma schema and database migrations.
    
*   public/: Static assets like images and fonts.
    
*   styles/: Global styles and Tailwind CSS configurations.
    

Scripts
-------

*   dev: Runs the development server.
    
*   build: Builds the application for production.
    
*   start: Starts the production server.
    
*   lint: Runs ESLint for code linting.
    

Contributing
------------

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
    
2.  Create a new branch: git checkout -b feature/your-feature-name.
    
3.  Make your changes and commit them: git commit -m 'Add your feature'.
    
4.  Push to the branch: git push origin feature/your-feature-name.
    
5.  Open a pull request.
    

License
-------

This project is licensed under the MIT License.

Feel free to customize this README.md further to match any additional features or configurations specific to your project.