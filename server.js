require('dotenv').config();
const express = require('express');
const path = require('path');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// --- CATÁLOGO DE VIDEOS Y SERVICIOS DE ZOOM DEL VALLE ---
const videoCatalog = {
    '1': { title: 'FINAL - RIO NEGRO VS MISIONES - ARG SELECCIONES SUB 16 DAMAS C', price: 10000, youtubeId: 'qIrsaljGXjc', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '2': { title: 'MISIONES VS CENTRO BUENOS AIRES - selecciones sub 16 Damas "C"', price: 10000, youtubeId: 'G0O88KHDYZc', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '3': { title: 'RIO NEGRO VS MISIONES - SELECCIONADOS SUB 16 DAMAS "c"', price: 10000, youtubeId: 'FY1lLgdLkoE', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '4': { title: 'RIO NEGRO VS NEUQUEN - SELECCIONADOS SUB 16 DAMAS "C"', price: 10000, youtubeId: 'KPWNrBFnVTQ', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '5': { title: 'Noroeste VS SAN LUIS.MP4 SELECCIONADOS DAMAS SUB 16 "C"', price: 10000, youtubeId: '5HteCJyadlg', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '6': { title: 'CAI - ALTA BARDA - DAMAS MAYORES - INTEGRACION', price: 10000, youtubeId: 'x8FvakrUwiA', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '7': { title: 'PERALES - MRC SEMI.MP4', price: 10000, youtubeId: 'nWFkRjlGJTA', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '8': { title: 'CABALLEROS : PERALES ALTA BARADA SEMI.MP4', price: 10000, youtubeId: '3eoRkkuNzQ4', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '9': { title: 'RIO NEGRO VS UDC (SUB 16) SEMIFINALES SELECCIONADO SUB 16 DAMAS "C"', price: 10000, youtubeId: 'tY_MhMCnJEU', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '10': { title: 'CIRCULO - CIPO CABALLEROS.mp4', price: 10000, youtubeId: 'zpJ_Ileqzsk', torneo: 'RIONEGRINO', categoria: 'CABALLEROS' },
    '11': { title: 'PERALES ALTA BARDA FINAL SUB 16.mp4', price: 10000, youtubeId: 'gGSAVeszFFQ', torneo: 'INTEGRACION', categoria: 'SUB 16' },
    '12': { title: 'CAI - NQN RUGBY (INTER).mp4', price: 10000, youtubeId: 'y7rnqAQFEnY', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '13': { title: 'SUB 16 - DAMAS RIO NEGRO VS CENTRO.MP4', price: 10000, youtubeId: 'dJ-MZJhcOc4', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '14': { title: 'MRC VS ALTA BARDA (3ER Y 4TO 1ERA DAMAS', price: 10000, youtubeId: '6iAjck0q2R0', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '15': { title: 'PERALES - SAN JORGE (FINAL CABALLEROS', price: 10000, youtubeId: 'A-WKbGwF72w', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '16': { title: 'PERALES - NQN RUGBY (SUB 19) .mp4', price: 10000, youtubeId: 'PtqjuSe8c6Q', torneo: 'INTEGRACION', categoria: 'DAMAS SUB 19' },
    '17': { title: 'PERALES - CAI (Final damas).mp4', price: 10000, youtubeId: 'yTXC42oKb5g', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '18': { title: 'MRC VS ALTA BARDA (FINAL EXTRA SUB14)', price: 10000, youtubeId: 'BFKmJ_KW5E0', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '19': { title: '16102026 - RIO NEGRO VS MARDEL - CABALLEROS SELECCIONES B', price: 50000, youtubeId: 'eQ_-RFNQBe0', torneo: 'SELECCIONES', categoria: 'CABALLEROS' },
    '20': { title: '16102026 - RIO NEGRO VS SUR DE CORDOBA - ARG SELE DAMAS "B"', price: 50000, youtubeId: '7_zOlfEFL4I', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '21': { title: '15102026 - RIO NEGRO VS LA PAMPA (DAMAS 2DO,3RO Y 4TO CUARTO)', price: 50000, youtubeId: 'W5PS_A5ZmlU', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '22': { title: '18102026 - RIO NEGRO VS SAN LUIS - 3RO/4TO DAMAS', price: 50000, youtubeId: 'DWVxdau3hrg', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '23': { title: '15102026 - LA PAMPA VS CORRENTINA - CAB "B"', price: 50000, youtubeId: 'vzB98phCJEg', torneo: 'SELECCIONES', categoria: 'CABALLEROS' },
    '24': { title: '17102026 - LA PAMPA VS SAN LUIS - SEMI DAMAS', price: 50000, youtubeId: 'nTv7HOhLy_U', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '25': { title: '17102026 RIO NEGRO VS SANRAFAEL SEMI DAMAS', price: 50000, youtubeId: '91kpWJvCnoE', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '26': { title: '16102026 - RIO NEGRO VS SAN LUIS - CAB "B"', price: 50000, youtubeId: 'Y7XQCTzX2gI', torneo: 'SELECCIONES', categoria: 'CABALLEROS' },
    '27': { title: '14102026 - SAN RAFAEL VS CHUBUT. SELE DAMAS MAYOR', price: 50000, youtubeId: 'FYqGCC26XM4', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '28': { title: '15102026 - MAR DEL PLATA VS SANLUISEÑA - SELE CABALLEROS', price: 50000, youtubeId: '-Sh3hegJH-E', torneo: 'SELECCIONES', categoria: 'CABALLEROS' },
    '29': { title: '15102026 -LA PAMPA VS SUR CORDOBA - SELECCIONADO DAMAS MAYOR SAN RAFAEL', price: 50000, youtubeId: 'XJyBJf55il8', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    
    // --- SERVICIO DE ANÁLISIS DE VIDEO ---
    'servicio-analisis': { 
        title: 'Análisis y Recorte de Jugadas Claves', 
        price: 20000, 
        youtubeId: '', 
        torneo: 'TU VIDEO', 
        categoria: 'SERVICIOS EXCLUSIVOS',
        customThumbnail: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop'
    }
};

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
            thumbnail: videoCatalog[key].customThumbnail || `https://img.youtube.com/vi/${videoCatalog[key].youtubeId}/hqdefault.jpg`
        };
    }
    res.json(catalogSafe);
});

app.post('/crear-pago', async (req, res) => {
    try {
        const { videoId, emailComprador } = req.body;
        const video = videoCatalog[videoId]; 
        
        if (!video) return res.status(404).json({ error: 'Video o Servicio no encontrado' });

        const preference = new Preference(client);
        const response = await preference.create({
            body: {
                items: [{ id: String(videoId), title: video.title, quantity: 1, unit_price: Number(video.price), currency_id: 'ARS' }],
                payer: { email: emailComprador },
                metadata: { video_id: String(videoId), email_comprador: emailComprador },
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

    if (videoId === 'servicio-analisis') {
        const mensajeWppAnalisis = encodeURIComponent(`¡Hola Matías! Ya aboné los $20.000 por el Análisis y Recorte de Jugadas. Acá te paso mi video/link para que arranquemos:`);
        const whatsappLinkAnalisis = `https://wa.me/5492948410629?text=${mensajeWppAnalisis}`;

        return res.send(`
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
                    <p class="mb-6">Ya tenés tu lugar para el <strong>${video.title}</strong>.</p>
                    <hr class="border-gray-600 mb-6">
                    <p class="text-lg text-gray-300 mb-6">Tocá el botón para enviarnos tu video por WhatsApp y empezamos a trabajar en tu análisis.</p>
                    <a href="${whatsappLinkAnalisis}" target="_blank" class="bg-green-600 hover:bg-green-500 px-8 py-4 rounded-lg text-lg font-bold block transition transform hover:scale-105 flex items-center justify-center gap-2">
                        📱 ENVIAR MI VIDEO POR WHATSAPP
                    </a>
                </div>
            </body>
            </html>
        `);
    }

    const youtubeLink = `https://youtube.com/watch?v=${video.youtubeId}`;
    const mensajeWppNormal = encodeURIComponent(`Hola Zoom del Valle, compré el acceso a "${video.title}" (Código de partido: ${videoId}) pero no recibí el mail. Mi pago ya está aprobado, ¿me pasan el link?`);
    const whatsappLinkNormal = `https://wa.me/5492948410629?text=${mensajeWppNormal}`;

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
                <a href="${youtubeLink}" target="_blank" class="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-lg text-lg font-bold block mb-6 transition transform hover:scale-105">▶ IR AL PARTIDO EN YOUTUBE</a>
                <hr class="border-gray-600 mb-6">
                <p class="text-sm text-gray-400 mb-3">¿Tuviste un problema y no te llegó el correo automático?</p>
                <a href="${whatsappLinkNormal}" target="_blank" class="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg text-sm font-bold block transition flex items-center justify-center gap-2">
                    📱 Reclamar acceso por WhatsApp
                </a>
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
                    
                    let asunto = '';
                    let cuerpoMail = '';

                    if (video_id === 'servicio-analisis') {
                        asunto = `Confirmación: ${video.title}`;
                        cuerpoMail = `¡Hola!\n\nEl pago de $20.000 se acreditó correctamente.\n\nPara arrancar, envianos el archivo de tu partido o el link de YouTube respondiendo este correo, o escribinos al WhatsApp: https://wa.me/5492948410629\n\n¡Manos a la obra!\nEquipo Zoom del Valle`;
                    } else {
                        const youtubeLink = `https://youtube.com/watch?v=${video.youtubeId}`;
                        asunto = `Tu acceso a: ${video.title}`;
                        cuerpoMail = `¡Hola!\n\nEl pago se acreditó correctamente.\n\nLink del partido: ${youtubeLink}\n\n¡Que lo disfrutes!\nEquipo Zoom del Valle`;
                    }

                    await transporter.sendMail({
                        from: `"Zoom del Valle" <${process.env.EMAIL_USER}>`,
                        to: email_comprador,
                        subject: asunto,
                        text: cuerpoMail
                    });
                }
            }
        } catch (error) {}
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Corriendo en puerto ${PORT}`));
