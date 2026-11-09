require('dotenv').config();
const express = require('express');
const path = require('path');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// Catálogo con Categorías, Club y Miniaturas Automáticas (poné solo el ID de YouTube)
const videoCatalog = {
    'vivo-perales': { 
        title: 'EN VIVO: Los Perales vs Marabunta', 
        price: 3500, 
        youtubeId: 'qQ7cQ-V8h1M', // Solo las letras del final del link de YouTube
        categoria: 'vivo',
        club: 'Los Perales'
    },
    'tactica-regional': { 
        title: 'Cámara Táctica - Final Regional Sub 16', 
        price: 2000, 
        youtubeId: 'dQw4w9WgXcQ', 
        categoria: 'tactica',
        club: 'Seleccionado'
    },
    'resumen-sub14': { 
        title: 'Compacto Torneo Neuquén Sub 14', 
        price: 1500, 
        youtubeId: 'jNQXAC9IVRw', 
        categoria: 'resumen',
        club: 'Neuquen'
    }
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Rutas
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Mandar catálogo a la web (ahora auto-genera las fotos desde YouTube)
app.get('/api/videos', (req, res) => {
    const catalogSafe = {};
    for (const key in videoCatalog) {
        catalogSafe[key] = {
            id: key,
            title: videoCatalog[key].title,
            price: videoCatalog[key].price,
            categoria: videoCatalog[key].categoria,
            club: videoCatalog[key].club,
            thumbnail: `https://img.youtube.com/vi/${videoCatalog[key].youtubeId}/hqdefault.jpg` // Foto automática
        };
    }
    res.json(catalogSafe);
});

// Cobro
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
        res.status(500).json({ error: 'Error al generar compra' });
    }
});

// Éxito
app.get('/exito', (req, res) => {
    const videoId = req.query.videoId;
    const video = videoCatalog[videoId];
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
                <a href="${youtubeLink}" target="_blank" class="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-lg text-lg font-bold block">▶ IR AL PARTIDO EN YOUTUBE</a>
            </div>
        </body>
        </html>
    `);
});

// Webhook
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
        } catch (error) { console.error(error); }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Corriendo en ${PORT}`));
