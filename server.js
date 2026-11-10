require('dotenv').config();
const express = require('express');
const path = require('path');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

let videoCatalog = {}; 

// LINK DIRECTO A TU EXCEL (Ya configurado)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1M9cjtuKszPsDyuYUln61J3_x0cwlduEyqeXVpWyHG3A/export?format=tsv';

async function actualizarCatalogo() {
    try {
        const res = await fetch(SHEET_URL);
        const text = await res.text();
        const lineas = text.split(/\r?\n/);
        const nuevoCatalogo = {};

        // Empezamos desde la línea 1 para saltar los encabezados
        for (let i = 1; i < lineas.length; i++) {
            if (!lineas[i].trim()) continue; 
            
            let [id, title, price, youtubeId, torneo, categoria] = lineas[i].split('\t');

            // 1. INTELIGENCIA: Auto-completar ID si la celda de la Columna A quedó vacía
            let idFinal = (id && id.trim() !== '') ? id.trim() : `video-auto-${i}`;
            
            // 2. INTELIGENCIA: Auto-recortar link de YouTube si pegaste la URL completa
            let ytFinal = youtubeId ? youtubeId.trim() : '';
            if (ytFinal.includes('youtu.be/')) {
                ytFinal = ytFinal.split('youtu.be/')[1].split(/[?#]/)[0];
            } else if (ytFinal.includes('youtube.com/watch')) {
                ytFinal = ytFinal.split('v=')[1]?.split(/[&?#]/)[0] || ytFinal;
            }

            // Si hay título, precio y video, lo guardamos en la página
            if (title && price && ytFinal) {
                nuevoCatalogo[idFinal] = {
                    title: title.trim(),
                    price: Number(price.trim()),
                    youtubeId: ytFinal,
                    torneo: torneo ? torneo.trim() : 'Amistoso',
                    categoria: categoria ? categoria.trim().toUpperCase() : 'GENERAL'
                };
            }
        }
        
        if (Object.keys(nuevoCatalogo).length > 0) {
            videoCatalog = nuevoCatalogo;
            console.log("Catálogo actualizado desde Google Sheets.");
        } else {
            console.log("Excel vacío o mal formateado. Usando video de prueba.");
            videoCatalog = {
                'video-prueba': { title: 'Prueba: Los Perales', price: 1500, youtubeId: 'GFqJqDvKM-o', torneo: 'Superliga NQN', categoria: 'PRIMERA DAMAS' }
            };
        }
    } catch (error) {
        console.error("Error al leer Google Sheets:", error);
    }
}

actualizarCatalogo();
setInterval(actualizarCatalogo, 5 * 60 * 1000);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/videos', (req, res) => {
    const catalogSafe = {};
    for (const key in videoCatalog) {
        catalogSafe[key] = {
            id: key,
            title: videoCatalog[key].title,
            price: videoCatalog[key].price,
            torneo: videoCatalog[key].torneo,
            categoria: videoCatalog[key].categoria,
            thumbnail: `https://img.youtube.com/vi/${videoCatalog[key].youtubeId}/hqdefault.jpg`
        };
    }
    res.json(catalogSafe);
});

app.post('/crear-pago', async (req, res) => {
    try {
        const { videoId, emailComprador } = req.body;
        const video = videoCatalog[videoId]; 
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
        res.status(500).json({ error: 'Error interno de cobro' });
    }
});

app.get('/exito', (req, res) => {
    const videoId = req.query.videoId;
    const video = videoCatalog[videoId];
    if (!video) return res.send('<h1>¡Gracias por tu compra! Revisá tu mail.</h1>');

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
                <a href="${youtubeLink}" target="_blank" class="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-lg text-lg font-bold block">▶ IR AL PARTIDO EN YOUTUBE</a>
            </div>
        </body>
        </html>
    `);
});

app.post('/webhook', async (req, res) => {
    const { query } = req;
    res.sendStatus(200);
    if ((query.topic || query.type) === 'payment') {
        try {
            const payment = new Payment(client);
            const paymentInfo = await payment.get({ id: query['data.id'] || query.id });
            if (paymentInfo.status === 'approved') {
                const { video_id, email_comprador } = paymentInfo.metadata;
                const video = videoCatalog[video_id];
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
        } catch (error) {}
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Corriendo en puerto ${PORT}`));
