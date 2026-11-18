require('dotenv').config();
const express = require('express');
const path = require('path');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// --- CATÁLOGO COMPLETO DE ZOOM DEL VALLE ---
const videoCatalog = {
    '1': { title: 'Los Perales vs Sporting', price: 80000, youtubeId: 'GFqJqDvKM-o', torneo: 'CAC B', categoria: 'DAMAS SUB 19' },
    '2': { title: 'PERALES VS MONTE HERMOSO', price: 80000, youtubeId: 'P0N2TelKRVI', torneo: 'CAC B', categoria: 'DAMAS SUB 19' },
    '3': { title: 'PERALES VS SAN JUAN', price: 80000, youtubeId: 'SnaUfNxgGBA', torneo: 'CAC B', categoria: 'DAMAS SUB 19' },
    '4': { title: 'LOS PERALES VS PARANA', price: 80000, youtubeId: 'yy0KMkbQ6YQ', torneo: 'CAC B', categoria: 'DAMAS SUB 19' },
    '5': { title: 'SAN JUAN RUGBY VS PARANA ROWIN', price: 80000, youtubeId: 'COM9N_tu-1Q', torneo: 'CAC B', categoria: 'DAMAS SUB 19' },
    '6': { title: 'RIO NEGRO VS CATAMARCA', price: 1, youtubeId: '3Kr6d9eb68k', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '8': { title: 'FINAL - RIO NEGRO VS MISIONES - ARG SELECCIONES SUB 16 DAMAS C', price: 10000, youtubeId: 'qIrsaljGXjc', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '9': { title: 'MISIONES VS CENTRO BUENOS AIRES - selecciones sub 16 Damas "C"', price: 10000, youtubeId: 'G0O88KHDYZc', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '10': { title: 'RIO NEGRO VS MISIONES - SELECCIONADOS SUB 16 DAMAS "c"', price: 10000, youtubeId: 'FY1lLgdLkoE', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '11': { title: 'RIO NEGRO VS NEUQUEN - SELECCIONADOS SUB 16 DAMAS "C"', price: 10000, youtubeId: 'KPWNrBFnVTQ', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '12': { title: 'Noroeste VS SAN LUIS.MP4 SELECCIONADOS DAMAS SUB 16 "C"', price: 10000, youtubeId: '5HteCJyadlg', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '13': { title: 'CAI - ALTA BARDA - DAMAS MAYORES - INTEGRACION', price: 10000, youtubeId: 'x8FvakrUwiA', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '14': { title: 'PERALES - MRC SEMI.MP4', price: 10000, youtubeId: 'nWFkRjlGJTA', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '15': { title: 'CABALLEROS : PERALES ALTA BARADA SEMI.MP4', price: 10000, youtubeId: '3eoRkkuNzQ4', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '16': { title: 'RIO NEGRO VS UDC (SUB 16) SEMIFINALES SELECCIONADO SUB 16 DAMAS "C"', price: 10000, youtubeId: 'tY_MhMCnJEU', torneo: 'SELECCIONES', categoria: 'CABALLEROS' },
    '17': { title: 'CIRCULO - CIPO CABALLEROS.mp4', price: 10000, youtubeId: 'zpJ_Ileqzsk', torneo: 'RIONEGRINO', categoria: 'CABALLEROS' },
    '18': { title: 'PERALES ALTA BARDA FINAL SUB 16.mp4', price: 10000, youtubeId: 'gGSAVeszFFQ', torneo: 'INTEGRACION', categoria: 'SUB 16' },
    '19': { title: 'CAI - NQN RUGBY (INTER).mp4', price: 10000, youtubeId: 'y7rnqAQFEnY', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '20': { title: 'SUB 16 - DAMAS RIO NEGRO VS CENTRO.MP4', price: 10000, youtubeId: 'dJ-MZJhcOc4', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '21': { title: 'MRC VS ALTA BARDA (3ER Y 4TO 1ERA DAMAS', price: 10000, youtubeId: '6iAjck0q2R0', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '22': { title: 'PERALES - SAN JORGE (FINAL CABALLEROS', price: 10000, youtubeId: 'A-WKbGwF72w', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '23': { title: 'PERALES - NQN RUGBY (SUB 19) .mp4', price: 10000, youtubeId: 'PtqjuSe8c6Q', torneo: 'INTEGRACION', categoria: 'DAMAS SUB 19' },
    '24': { title: 'PERALES - CAI (Final damas).mp4', price: 10000, youtubeId: 'yTXC42oKb5g', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '25': { title: 'MRC VS ALTA BARDA (FINAL EXTRA SUB14)', price: 10000, youtubeId: 'BFKmJ_KW5E0', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '26': { title: '16102026 - RIO NEGRO VS MARDEL - CABALLEROS SELECCIONES B', price: 50000, youtubeId: 'eQ_-RFNQBe0', torneo: 'SELECCIONES', categoria: 'CABALLEROS' },
    '27': { title: '16102026 - RIO NEGRO VS SUR DE CORDOBA - ARG SELE DAMAS "B"', price: 50000, youtubeId: '7_zOlfEFL4I', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '28': { title: '15102026 - RIO NEGRO VS LA PAMPA (DAMAS 2DO,3RO Y 4TO CUARTO)', price: 50000, youtubeId: 'W5PS_A5ZmlU', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '29': { title: '18102026 - RIO NEGRO VS SAN LUIS - 3RO/4TO DAMAS', price: 50000, youtubeId: 'DWVxdau3hrg', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '30': { title: '15102026 - LA PAMPA VS CORRENTINA - CAB "B"', price: 50000, youtubeId: 'vzB98phCJEg', torneo: 'SELECCIONES', categoria: 'CABALLEROS' },
    '31': { title: '17102026 - LA PAMPA VS SAN LUIS - SEMI DAMAS', price: 50000, youtubeId: 'nTv7HOhLy_U', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '32': { title: '17102026 RIO NEGRO VS SANRAFAEL SEMI DAMAS', price: 50000, youtubeId: '91kpWJvCnoE', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '33': { title: '16102026 - RIO NEGRO VS SAN LUIS - CAB "B"', price: 50000, youtubeId: 'Y7XQCTzX2gI', torneo: 'SELECCIONES', categoria: 'CABALLEROS' },
    '34': { title: '14102026 - SAN RAFAEL VS CHUBUT. SELE DAMAS MAYOR', price: 50000, youtubeId: 'FYqGCC26XM4', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '35': { title: '15102026 - MAR DEL PLATA VS SANLUISEÑA - SELE CABALLEROS', price: 50000, youtubeId: '-Sh3hegJH-E', torneo: 'SELECCIONES', categoria: 'CABALLEROS' },
    '36': { title: '15102026 -LA PAMPA VS SUR CORDOBA - SELECCIONADO DAMAS MAYOR SAN RAFAEL', price: 50000, youtubeId: 'XJyBJf55il8', torneo: 'SELECCIONES', categoria: 'DAMAS MAYORES' },
    '37': { title: '29102026 SPORTING VS BANCO MENDOZA CAC B', price: 80000, youtubeId: '-fNEweFxUYQ', torneo: 'CAC B', categoria: 'DAMAS SUB 19' },
    '38': { title: '10102026 - PRIMERA DAMAS - PERALES VS ROCA. (F.2 RIONEGRINO)', price: 50000, youtubeId: 'QkkCepYZ6B0', torneo: 'RIONEGRINO', categoria: 'DAMAS MAYORES' },
    '39': { title: '03102026 - NAUTICO VS ROCA - CRC A S16', price: 50000, youtubeId: 'mS9-Vk3aZrc', torneo: 'CRC A', categoria: 'SUB 16' },
    '40': { title: '03102026 LA BARRANCA VS PERALES CRC', price: 50000, youtubeId: 'EJ3lf4PVBwQ', torneo: 'CRC A', categoria: 'SUB 16' },
    '41': { title: '03102026 - SANTA ROSA VS CHENQUE - CRC B S16', price: 40000, youtubeId: 'Age8DndSUb8', torneo: 'CRC B', categoria: 'SUB 16' },
    '42': { title: '02102026 MARABUNTA VS LA BARRANCA CRC A S16', price: 50000, youtubeId: 'Rjz48EyPL8E', torneo: 'CRC A', categoria: 'SUB 16' },
    '43': { title: '01102026 - MRC A VS NAUTICO - CRC A S16', price: 50000, youtubeId: 'oHFZIUtU2MU', torneo: 'CRC A', categoria: 'SUB 16' },
    '44': { title: '01102026 - CALAFATE VS ESTUDIANTES STA ROSA- CRC B S16', price: 40000, youtubeId: 'F4163Aq8ek4', torneo: 'CRC B', categoria: 'SUB 16' },
    '45': { title: '01102026 - ALTA BARDA VS SANTA ROSA - CRC B S16', price: 40000, youtubeId: 'FWcWQuR6dy4', torneo: 'CRC B', categoria: 'SUB 16' },
    '46': { title: '19092026 - RIO NEGRO VS NORO - ARG DE SELECCIONES SUB 19 B DAMAS', price: 50000, youtubeId: 'lCEwhmzHRO4', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 19' },
    '47': { title: '19092026 - LA PAMPA VS CHACO - ARG DE SELECCIONES SUB 19 B DAMAS', price: 50000, youtubeId: 'AGd7nVIaEnA', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 19' },
    '48': { title: '19092026 - LA PAMPA VS CENTRO BS AS - ARG DE SELECCIONES SUB 19 B DAMAS', price: 50000, youtubeId: '59g7PLo6LOQ', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 19' },
    '49': { title: '18092026 - RIO NEGRO VS AHO - ARGENTINO DE SELECCIONES SUB 19 B DAMAS', price: 50000, youtubeId: '0JM8uD3jv4U', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 19' },
    '50': { title: '18092026 - RIO NEGRO VS CHUBUT - ARGENTINO DE SELECCIONES SUB 19 B DAMAS', price: 50000, youtubeId: 'uzamqWqsuCg', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 19' },
    '51': { title: '17092026 - NOROESTE VS AHO - ARGENTINO DE SELECCIONES SUB 19 B DAMAS', price: 50000, youtubeId: '8KrREQls_Pk', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 19' },
    '52': { title: '17092026 CHUBUT VS AHO - ARGENTINO DE SELECCIONES SUB 19 B DAMAS', price: 50000, youtubeId: '7DiRRaceTaY', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '53': { title: 'BAHIA VS LA PAMPA - SELECCIONES SUB 16 B', price: 50000, youtubeId: 'YX8kNNRA1wQ', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '54': { title: 'RIO NEGRO VS BAHIA BLANCA - SELECCIONES SUB 16 B', price: 50000, youtubeId: 'ToTRADAGd-8', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '55': { title: 'RIO NEGRO VS SANTA FE - SELECCIONES SUB 16 B', price: 50000, youtubeId: 'ADR1ydGTCd4', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '56': { title: 'RIO NEGRO VS LA PAMPA - SELECCIONES SUB 16 B', price: 50000, youtubeId: '2ueZuKLmCwM', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '57': { title: 'RIO NEGRO VS MARDEL - SELECCIONES SUB 16 B', price: 50000, youtubeId: 'N1lfC7JNVuE', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '58': { title: 'MARDEL VS SANTA FE - SELECCIONES SUB 16 B', price: 50000, youtubeId: 'Ad6tbYKPpN8', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '59': { title: 'RIO NEGRO VS SANTIAGO - SELECCIONES SUB 16 B', price: 50000, youtubeId: 'ra-GCzSFOcI', torneo: 'SELECCIONES', categoria: 'SUB 16' },
    '60': { title: 'NEUQUEN VS BS AS CENTRO - S14 CAS B', price: 50000, youtubeId: '9s_OVCcoIZo', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 14' },
    '61': { title: 'MARDEL VS BS CENTRO - S14 CAS B', price: 50000, youtubeId: '6hBvJZaKb1U', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 14' },
    '62': { title: 'NEUQUEN VS TANDIL - S14 CAS B', price: 50000, youtubeId: '72SOYPlytjY', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 14' },
    '63': { title: 'NEUQUEN VS MAR DEL PLATA - S14 CAS B', price: 50000, youtubeId: 'wJWXfhoBri4', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 14' },
    '64': { title: 'NEUQUEN VS BAHIA - S14 CAS B', price: 50000, youtubeId: 'vr4Fum70kN4', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 14' },
    '65': { title: 'BAHIA BLANCA VS MARDEL - S14 CAS B', price: 50000, youtubeId: 'RUplJ4KcbY4', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 14' },
    '66': { title: 'NEUQUEN VS SANTA FE - S14 CAS B', price: 50000, youtubeId: 'y1mYVMdyrtU', torneo: 'SELECCIONES', categoria: 'DAMAS SUB 14' },
    '67': { title: 'PERALES VS SAN JORGE (FINAL I.26)', price: 10000, youtubeId: 'KbDN4VLCVyk', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '68': { title: 'NQN VS SAN JORGE (SEMI I.26)', price: 10000, youtubeId: 'MgoDVhLu7l4', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '69': { title: 'PERALES VS CAI', price: 10000, youtubeId: 'VB_-gKUw0s4', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '70': { title: 'SAN JORGE VS NQN RUGBY', price: 10000, youtubeId: '8PpxdShE5I8', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '71': { title: 'MRC VS CAI', price: 10000, youtubeId: 'KexqEZoxq9U', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '72': { title: 'CIPOLLETTI VS CAI', price: 10000, youtubeId: 'K_s47JtOXz0', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '73': { title: 'CAI VS ROCA', price: 10000, youtubeId: 'QHXWQXwbHho', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '74': { title: 'PERALES VS ALTA BARDA', price: 10000, youtubeId: 'fGD1hxY3CbM', torneo: 'INTEGRACION', categoria: 'SUB 16' },
    '75': { title: 'PRIMERA DAMAS PERALES VS CAI', price: 10000, youtubeId: '9zJWaYx6wrg', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '76': { title: 'INTERMEDIA - MRC VS ALTA BARDA', price: 10000, youtubeId: 'ttQvZUGFbUI', torneo: 'INTEGRACION', categoria: 'INTERMEDIA' },
    '77': { title: 'SUB 19 PERALES VS ALTA BARDA', price: 10000, youtubeId: 'WeudRBsYXCs', torneo: 'INTEGRACION', categoria: 'DAMAS SUB 19' },
    '78': { title: 'CABALLEROS - LIMAY VS HUINCUL', price: 10000, youtubeId: 'McmlCdT65CM', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '79': { title: 'CABALLEROS - CIPO VS BICICROS', price: 10000, youtubeId: 'XquF9qmPI_E', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '80': { title: 'CABALLEROS - CAI VS CUC', price: 10000, youtubeId: 'oISF7d3_9jE', torneo: 'INTEGRACION', categoria: 'CABALLEROS' },
    '81': { title: 'PRIMERA DAMAS - CAI VS NQN RUGBY', price: 10000, youtubeId: 'CHgg-mtk60I', torneo: 'INTEGRACION', categoria: 'DAMAS MAYORES' },
    '82': { title: 'SUB 19 - ALTA BARDA VS MRC', price: 10000, youtubeId: 'RSnwMeum6M8', torneo: 'INTEGRACION', categoria: 'DAMAS SUB 19' },
    '83': { title: 'SUB 19 - PERALES VS NQN RUGBY', price: 10000, youtubeId: '6BY6e_MXmUc', torneo: 'INTEGRACION', categoria: 'DAMAS SUB 19' },
    '84': { title: 'PARTIDO ADICIONAL', price: 10000, youtubeId: '1psXc8IbbXU', torneo: 'INTEGRACION', categoria: 'GENERAL' },

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

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/videos', (req, res) => {
    const catalogSafe = {};
    for (const key in videoCatalog) {
        let thumb = videoCatalog[key].customThumbnail || `https://img.youtube.com/vi/${videoCatalog[key].youtubeId}/hqdefault.jpg`;
        catalogSafe[key] = {
            id: key,
            title: videoCatalog[key].title,
            price: videoCatalog[key].price,
            torneo: videoCatalog[key].torneo,
            categoria: videoCatalog[key].categoria,
            thumbnail: thumb
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
                auto_return: 'approved'
            }
        });
        res.json({ init_point: response.init_point });
    } catch (error) {
        res.status(500).json({ error: 'Error interno de cobro' });
    }
});

// --- PANTALLA DE ÉXITO (ENTREGA INMEDIATA EN PANTALLA + WHATSAPP) ---
app.get('/exito', (req, res) => {
    const videoId = req.query.videoId;
    const video = videoCatalog[videoId];
    if (!video) return res.send('<h1>¡Gracias por tu compra!</h1>');

    if (videoId === 'servicio-analisis') {
        const mensajeWppAnalisis = encodeURIComponent(`¡Hola Matías! Ya aboné los $20.000 por el Análisis y Recorte de Jugadas. Acá te paso mi video/link para que arranquemos:`);
        const whatsappLinkAnalisis = `https://wa.me/5492948410629?text=${mensajeWppAnalisis}`;

        return res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdn.tailwindcss.com"></script>
                <title>Pago Aprobado | Zoom del Valle</title>
            </head>
            <body class="bg-gray-900 text-white flex items-center justify-center h-screen p-4">
                <div class="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center max-w-lg shadow-2xl">
                    <div class="text-green-400 text-5xl mb-4">✓</div>
                    <h1 class="text-3xl font-bold mb-2">¡Pago Aprobado!</h1>
                    <p class="mb-6">Ya tenés tu lugar contratado para:<br><strong>${video.title}</strong></p>
                    <hr class="border-gray-600 mb-6">
                    <p class="text-sm text-gray-300 mb-6">Tocá el botón para enviarnos tu material por WhatsApp y comenzar con el análisis táctico.</p>
                    <a href="${whatsappLinkAnalisis}" target="_blank" class="bg-green-600 hover:bg-green-500 px-8 py-4 rounded-lg text-lg font-bold block transition transform hover:scale-105 flex items-center justify-center gap-2">
                        📱 ENVIAR MI VIDEO POR WHATSAPP
                    </a>
                </div>
            </body>
            </html>
        `);
    }

    const youtubeLink = `https://youtube.com/watch?v=${video.youtubeId}`;
    const mensajeWpp = encodeURIComponent(`Hola Zoom del Valle, acabo de comprar el acceso a "${video.title}" (Código: ${videoId}). Mi pago está aprobado, ¿me guardás el contacto?`);
    const whatsappLink = `https://wa.me/5492948410629?text=${mensajeWpp}`;

    res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com"></script>
            <title>Acceso Liberado | Zoom del Valle</title>
        </head>
        <body class="bg-gray-900 text-white flex items-center justify-center h-screen p-4">
            <div class="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center max-w-lg shadow-2xl">
                <div class="text-green-400 text-5xl mb-4">✓</div>
                <h1 class="text-3xl font-bold mb-2">¡Pago Aprobado!</h1>
                <p class="mb-6 text-gray-300">Acceso liberado al partido:<br><strong class="text-white text-lg">${video.title}</strong></p>
                
                <a href="${youtubeLink}" target="_blank" class="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-lg text-lg font-bold block mb-6 transition transform hover:scale-105 shadow-lg">
                    ▶ VER PARTIDO EN YOUTUBE
                </a>

                <hr class="border-gray-600 mb-6">

                <p class="text-xs text-gray-400 mb-3">¿Querés reportar este acceso o guardarlo en tu celu?</p>
                <a href="${whatsappLink}" target="_blank" class="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg text-sm font-bold block transition flex items-center justify-center gap-2">
                    📱 Guardar / Consultar por WhatsApp
                </a>
            </div>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Corriendo en puerto ${PORT}`));
