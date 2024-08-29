import { createServer } from "http";

const server = createServer((_req, res) => {
    res.writeHead(200);
    res.end("Hello there");
});

server.listen(9000, () => {
    console.log("Server is running on port 9000");
});
