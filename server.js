require('dotenv').config();
const express = require('express');
const path = require('path');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// --- CONEXIÓN A GOOGLE SHEET ---
let videoCatalog = {}; 

// LINK DIRECTO DE DESCARGA TSV DE TU ARCHIVO
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
            
            // Leemos las 6 columnas de tu Excel de hockey
            const [id, title, price, youtubeId, torneo, categoria] = lineas[i].split('\t');

            if (id && title && price && youtubeId) {
                nuevoCatalogo[id.trim()] = {
                    title: title.trim(),
                    price: Number(price.trim()),
                    youtubeId: youtubeId.trim(),
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
        videoCatalog = {
            'video-prueba': { title: 'Prueba: Los Perales', price:
