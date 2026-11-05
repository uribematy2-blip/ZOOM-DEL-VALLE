require('dotenv').config();
const express = require('express');
const path = require('path');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Servir la página web estática (index.html)
app.use(express.static(__dirname));

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// Catálogo de videos (Podés cambiar los precios y links de YouTube aquí)
const videoCatalog = {
    'vivo-proximo': { 
        title: 'Transmisión EN VIVO - Primera División', 
        price: 10, 
        youtubeLink: 'https://youtube.com/live/XXXXXXX' 
    },
    'sub14-regional': { 
        title: 'Partido Sub 14 - Campeonato Regional', 
        price: 2000, 
        youtubeLink: 'https://youtu.be/YYYYYYY' 
    }
};

// Configuración de Nodemailer para enviar mails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- RUTAS ---

// 1. Servir el index.html en la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Crear la preferencia de pago
app.post('/crear-pago', async (req, res) => {
    try {
        const { videoId, emailComprador } = req.body;
        const video = videoCatalog[videoId];

        if (!video) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }

        const preference = new Preference(client);
        
        const response = await preference.create({
            body: {
                items: [
                    {
                        id: videoId,
                        title: video.title,
                        quantity: 1,
                        unit_price: Number(video.price),
                        currency_id: 'ARS'
                    }
                ],
                payer: { email: emailComprador },
                metadata: {
                    video_id: videoId,
                    email_comprador: emailComprador
                },
                // Redirección automática ACTIVADA usando tu link de Ngrok
                back_urls: {
                    success: `https://residue-sierra-kitchen.ngrok-free.dev/exito?videoId=${videoId}`,
                    failure: "https://residue-sierra-kitchen.ngrok-free.dev/",
                    pending: "https://residue-sierra-kitchen.ngrok-free.dev/"
                },
                auto_return: 'approved',
                // Webhook conectado para que Mercado Pago avise de la compra
                notification_url: 'https://residue-sierra-kitchen.ngrok-free.dev/webhook' 
            }
        });

        res.json({ init_point: response.init_point });

    } catch (error) {
        console.error('Error al crear preferencia:', error);
        res.status(500).json({ error: 'Error al generar la compra' });
    }
});

// 3. Pantalla de Éxito (a donde vuelve el cliente tras pagar)
app.get('/exito', (req, res) => {
    const videoId = req.query.videoId;
    const video = videoCatalog[videoId];

    if (!video) {
        return res.send('<h1>¡Gracias por tu compra! Te enviamos el link por mail.</h1>');
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <script src="https://cdn.tailwindcss.com"></script>
            <title>Pago Aprobado | Zoom del Valle</title>
        </head>
        <body class="bg-gray-900 text-white font-sans flex items-center justify-center h-screen p-4">
            <div class="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center max-w-lg shadow-2xl">
                <div class="text-green-400 text-5xl mb-4">✓</div>
                <h1 class="text-3xl font-bold text-green-400 mb-2">¡Pago Aprobado!</h1>
                <p class="text-gray-300 mb-6">Ya podés acceder a: <br><strong class="text-white">${video.title}</strong></p>
                
                <a href="${video.youtubeLink}" target="_blank" class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-lg text-lg transition-transform transform hover:scale-105">
                    ▶ IR AL PARTIDO EN YOUTUBE
                </a>

                <p class="text-sm text-gray-400 mt-6">También te enviamos una copia de este enlace a tu correo electrónico.</p>
            </div>
        </body>
        </html>
    `);
});

// 4. Webhook (Mercado Pago confirma el pago acreditado en segundo plano)
app.post('/webhook', async (req, res) => {
    const { query } = req;
    const topic = query.topic || query.type;

    res.sendStatus(200);

    if (topic === 'payment') {
        const paymentId = query['data.id'] || query.id;
        
        try {
            const payment = new Payment(client);
            const paymentInfo = await payment.get({ id: paymentId });

            if (paymentInfo.status === 'approved') {
                const { video_id, email_comprador } = paymentInfo.metadata;
                const video = videoCatalog[video_id];

                if (video && email_comprador) {
                    await transporter.sendMail({
                        from: `"Zoom del Valle" <${process.env.EMAIL_USER}>`,
                        to: email_comprador,
                        subject: `Acceso a: ${video.title}`,
                        text: `¡Hola!\n\nGracias por tu compra. Podés ver el partido directamente desde este enlace:\n${video.youtubeLink}\n\n¡Que lo disfrutes!\nEquipo de Zoom del Valle`
                    });
                    console.log(`Mail enviado con éxito a ${email_comprador}`);
                }
            }
        } catch (error) {
            console.error('Error procesando Webhook:', error);
        }
    }
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor de Zoom del Valle corriendo en http://localhost:${PORT}`);
});
