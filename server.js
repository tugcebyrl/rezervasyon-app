const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let rezervasyonlar = [];

wss.on("connection", (ws) => {
    console.log("Yeni bir istemci bağlandı");

    ws.send(JSON.stringify(rezervasyonlar));

    ws.on("message", (message) => {
        const data = JSON.parse(message);
        if (data.type === "ekle") {
            rezervasyonlar.push(data.rezervasyon);
        } else if (data.type === "iptal") {
            rezervasyonlar = rezervasyonlar.filter(r => r.id !== data.id);
        } else if (data.type === "guncelle") {
            rezervasyonlar = rezervasyonlar.map(r =>
                r.id === data.rezervasyon.id ? data.rezervasyon : r
            );
        }       

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(rezervasyonlar));
            }
        });
    });

    ws.on("close", () => console.log("İstemci bağlantıyı kapattı"));
});

// Statik dosyaları sun (Frontend için)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor`));
