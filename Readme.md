###BUILDING

There are 2 projects, one for client and one for the server

Client

1. From the root run npm install
2. npm run start. You can leave the watch running if you want.

Server

1. AFTER building the client at least 1 time there will be a /public folder in the server directory. This is where the client bundle is served from
2. cd into server directory and run npm install
3. npm run build
4. browser to http://localhost:8082