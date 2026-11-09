require('dotenv').config();
const express = require('express');
const path = require('path');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// --- 1. CONFIGURACIÓN DEL SISTEMA HÍBRIDO ---

// A. Configuración de automatización de YouTube (Acá ponemos el precio de los videos que se cargan solos)
const PRECIO_FIJO_AUTOMATICO = 1500; 
const CHANNEL_ID = 'UCMkw40MumgaOJJiA9eCE6gw'; // Tu ID oficial de @ZOOMDELVALLE

// B. Catálogo Manual (Acá agregarás a mano los partidos EN VIVO o finales especiales más adelante)
const manualCatalog = {
    // Te dejo uno de ejemplo apagado. Cuando lo necesites, lo modificás.
    'vivo-ejemplo': { 
        title: 'EN VIVO: Gran Final (Ejemplo)', 
        price: 3500, 
        youtubeId: 'ID_DE_YOUTUBE_ACA', // ej: qQ7cQ-V8h1M
        categoria: 'vivo',
        club: 'Los Perales'
    }
};

// Memoria principal (mezcla los manuales y los automáticos de tu canal)
let globalCatalog = { ...manualCatalog };

// --- 2. EL MOTOR QUE "CHUPA" TUS VIDEOS SOLOS ---
async function actualizarCatalogoAutomatico() {
    try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
        const response = await fetch(rssUrl);
        const xml = await response.text();
        
        // Cortamos el texto para separar cada video
        const entries = xml.split('<entry>');
        entries.shift(); // Descartamos la información general del canal

        entries.forEach(entry => {
            // Buscamos el ID del video y el Título oficial que le pusiste en YouTube
            const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
            const titleMatch = entry.match(/<title>(.*?)<\/title>/);
            
            if (videoIdMatch && titleMatch) {
                const videoId = videoIdMatch[1];
                const title = titleMatch[1];
                
                // Lo inyectamos a tu página web listo para cobrar
                globalCatalog[`auto-${videoId}`] = {
                    title: title,
                    price: PRECIO_FIJO_AUTOMATICO,
                    youtubeId: videoId,
                    categoria: 'resumen', // Van directo a la fila de Compactos
                    club: 'Todos'
                };
            }
        });
        console.log("Catálogo actualizado desde YouTube exitosamente.");
    } catch (error) {
        console.error("Error leyendo tu canal de YouTube:", error);
    }
}

// Ejecutamos la búsqueda al arrancar, y luego cada 1 hora para no saturar
actualizarCatalogoAutomatico();
setInterval(actualizarCatalogoAutomatico, 3600000); 

// --- 3. CONFIGURACIÓN DE CORREO ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- 4. RUTAS DE LA PÁGINA ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/videos', (req, res) => {
    const catalogSafe = {};
    for (const key in globalCatalog) {
        // Ignoramos el vivo de ejemplo si no le pusiste un ID real
        if(key === 'vivo-ejemplo' && globalCatalog[key].youtubeId === 'ID_DE_YOUTUBE_ACA') continue;

        catalogSafe[key] = {
            id: key,
            title: globalCatalog[key].title,
            price: globalCatalog[key].price,
            categoria: globalCatalog[key].categoria,
            club: globalCatalog[key].club,
            thumbnail: `https://img.youtube.com/vi/${globalCatalog[key].youtubeId}/hqdefault.jpg`
        };
    }
    res.json(catalogSafe);
});

// Proceso de Cobro
app.post('/crear-pago', async (req, res) => {
    try {
        const { videoId, emailComprador } = req.body;
        const video = globalCatalog[videoId]; 
        
        if (!video) return res.status(404).json({ error: 'Video no encontrado' });

        const preference = new Preference(client);
        const response = await preference.create({
            body: {
                items: [{ id: videoId, title: video.title, quantity: 1, unit_price: Number(video.price), currency_id: 'ARS' }],
                payer: { email: emailComprador },
                metadata: { video_id: videoId, email_comprador: emailComprador },
                back_urls: {
                    success: `https://zoom-del-valle.onrender.com/exito?videoId=${videoId}`,
                    failure: "https://zoom-del-valle.onrender.com/",
                    pending: "https://zoom-del-valle.onrender.com/"
                },
                auto_return: 'approved',
                notification_url: 'https://zoom-del-valle.onrender.com/webhook' 
            }
        });
        res.json({ init_point: response.init_point });
    } catch (error) {
        res.status(500).json({ error: 'Error al generar compra' });
    }
});

// Pantalla de Éxito
app.get('/exito', (req, res) => {
    const videoId = req.query.videoId;
    const video = globalCatalog[videoId];
    if (!video) return res.send('<h1>¡Gracias por tu compra! Te enviamos el link por mail.</h1>');

    const youtubeLink = `https://youtube.com/watch?v=${video.youtubeId}`;

    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <script src="https://cdn.tailwindcss.com"></script>
            <title>Pago Aprobado</title>
        </head>
        <body class="bg-gray-900 text-white flex items-center justify-center h-screen p-4">
            <div class="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center max-w-lg shadow-2xl">
                <div class="text-green-400 text-5xl mb-4">✓</div>
                <h1 class="text-3xl font-bold mb-2">¡Pago Aprobado!</h1>
                <p class="mb-6">Acceso liberado a:<br><strong>${video.title}</strong></p>
                <a href="${youtubeLink}" target="_blank" class="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-lg text-lg font-bold block transition transform hover:scale-105">▶ IR AL PARTIDO EN YOUTUBE</a>
            </div>
        </body>
        </html>
    `);
});

// Webhook (Acá se envía el mail automático)
app.post('/webhook', async (req, res) => {
    const { query } = req;
    const topic = query.topic || query.type;
    res.sendStatus(200);

    if (topic === 'payment') {
        try {
            const payment = new Payment(client);
            const paymentInfo = await payment.get({ id: query['data.id'] || query.id });

            if (paymentInfo.status === 'approved') {
                const { video_id, email_comprador } = paymentInfo.metadata;
                const video = globalCatalog[video_id];

                if (video && email_comprador) {
                    const youtubeLink = `https://youtube.com/watch?v=${video.youtubeId}`;
                    await transporter.sendMail({
                        from: `"Zoom del Valle" <${process.env.EMAIL_USER}>`,
                        to: email_comprador,
                        subject: `Tu acceso a: ${video.title}`,
                        text: `¡Hola!\n\nEl pago se acreditó correctamente.\n\nLink del partido: ${youtubeLink}\n\n¡Que lo disfrutes!\nEquipo Zoom del Valle`
                    });
                }
            }
        } catch (error) { console.error(error); }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Corriendo en puerto ${PORT}`));
