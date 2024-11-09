# Parfume Backend

## Disclaimer
All secrets and envs used in this project are for development purposes only. Do not use them in production, and they will not  be used in production.

*GitGuardian has been used to scan the repository for any secrets that may have been accidentally committed, it can give some errors for the certs directory, it's not a problem for us*

## Description
This is a backend for a perfume shop. It is a RESTful API that allows users to create, read, update and delete perfumes. It also allows users to create, read, update and delete orders. The API is built using Node.js, Express.js and MongoDB.


## Installation

### Install Dependencies
Make sure you've installed the Node.js and Yarn. You can install the dependencies by running the following command in the root directory of the project:
```bash
npm install
```

### Environment Variables
You will find them in the `.env.development` file.

### Other Dependencies
- MongoDB
- Redis

### MongoDB Installation
You can go to the services directory and in there you will find an another directory which is called `mongodb`. In there you will find a `docker-compose.yml` file. You can run the following command in the root directory of the project to start the MongoDB service:
```bash
docker-compose up --build -d
```

### Redis Installation
You can go to the services directory and in there you will find an another directory which is called `redis`. In there you will find a `docker-compose.yml` file. You can run the following command in the root directory of the project to start the Redis service:
```bash
docker-compose up --build -d
```

### Start the Server
You can start the server by running the following command in the root directory of the project:
```bash
npm run start:dev
```
This will start the server in development mode, you will see the logs in the console.

### Create or Re-Create the Secret Keys
We have total of 2 certificates to create the authentication base, since we have access and refresh tokens. To create the certificates, you can run the following command in the root directory of the project:

```bash
npm run create-certs
```
