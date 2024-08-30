import http from "http";
import app from "./src/app.js";
import { initSocket } from "./src/websocket/socket.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs"; 


// Load the YAML file
const swaggerDocument = YAML.load("./src/documentation/api-docs.yaml"); 

// Serve the Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
