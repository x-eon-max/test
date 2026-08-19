// ==UserScript==
// @name         Éditeur de Bannière Musique (Interactif)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Bouton flottant pour modifier la bannière "Featured" à la volée
// @match        *://*.LE-SITE-EN-QUESTION.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Clé pour sauvegarder les infos dans le navigateur
    const STORAGE_KEY = 'custom_banner_data';

    // Style de l'interface (CSS)
    const style = document.createElement('style');
    style.innerHTML = `
        #custom-banner-btn {
            position: fixed; bottom: 20px; right: 20px; z-index: 999999;
            background: #dc2626; color: white; border: none; border-radius: 50%;
            width: 50px; height: 50px; font-size: 24px; cursor: pointer;
            box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4); transition: transform 0.2s;
        }
        #custom-banner-btn:hover { transform: scale(1.1); }
        
        #custom-banner-panel {
            position: fixed; bottom: 80px; right: 20px; z-index: 999999;
            background: #1a1a1a; border: 1px solid #333; border-radius: 12px;
            padding: 20px; width: 300px; color: white; display: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); font-family: sans-serif;
        }
        #custom-banner-panel.show { display: block; }
        #custom-banner-panel h4 { margin: 0 0 15px 0; color: #dc2626; }
        
        .c-input-group { margin-bottom: 10px; }
        .c-input-group label { display: block; font-size: 12px; margin-bottom: 4px; color: #aaa; }
        .c-input-group input { 
            width: 100%; box-sizing: border-box; padding: 8px; 
            background: #0f0f0f; border: 1px solid #444; color: white; border-radius: 6px;
        }
        
        .c-actions { display: flex; gap: 10px; margin-top: 15px; }
        .c-btn {
            flex: 1; padding: 8px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;
        }
        .c-btn-save { background: #dc2626; color: white; }
        .c-btn-reset { background: #444; color: white; }
    `;
    document.head.appendChild(style);

    // Interface HTML
    const panelHTML = `
        <button id="custom-banner-btn">✏️</button>
        <div id="custom-banner-panel">
            <h4>Modifier la bannière</h4>
            <div class="c-input-group">
                <label>Titre</label>
                <input type="text" id="cb-titre" placeholder="Titre principal">
            </div>
            <div class="c-input-group">
                <label>Sous-titre</label>
                <input type="text" id="cb-sous-titre" placeholder="Description">
            </div>
            <div class="c-input-group">
                <label>Badge</label>
                <input type="text" id="cb-badge" placeholder="Featured Custom">
            </div>
            <div class="c-input-group">
                <label>Lien de l'image (URL)</label>
                <input type="text" id="cb-image" placeholder="https://...">
            </div>
            <div class="c-input-group">
                <label>Lien de redirection (URL)</label>
                <input type="text" id="cb-lien" placeholder="https://...">
            </div>
            <div class="c-actions">
                <button class="c-btn c-btn-reset" id="cb-btn-reset">Réinitialiser</button>
                <button class="c-btn c-btn-save" id="cb-btn-save">Appliquer</button>
            </div>
        </div>
    `;
    const uiContainer = document.createElement('div');
    uiContainer.innerHTML = panelHTML;
    document.body.appendChild(uiContainer);

    // Éléments du DOM
    const btn = document.getElementById('custom-banner-btn');
    const panel = document.getElementById('custom-banner-panel');
    const inputTitre = document.getElementById('cb-titre');
    const inputSousTitre = document.getElementById('cb-sous-titre');
    const inputBadge = document.getElementById('cb-badge');
    const inputImage = document.getElementById('cb-image');
    const inputLien = document.getElementById('cb-lien');

    // Charger les données sauvegardées
    let customData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;

    if (customData) {
        inputTitre.value = customData.titre;
        inputSousTitre.value = customData.sousTitre;
        inputBadge.value = customData.badge;
        inputImage.value = customData.image;
        inputLien.value = customData.lien;
    }

    // Ouvrir/Fermer le panneau
    btn.addEventListener('click', () => {
        panel.classList.toggle('show');
    });

    // Sauvegarder et appliquer
    document.getElementById('cb-btn-save').addEventListener('click', () => {
        customData = {
            titre: inputTitre.value,
            sousTitre: inputSousTitre.value,
            badge: inputBadge.value,
            image: inputImage.value,
            lien: inputLien.value
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customData));
        appliquerModifications(true); // Forcer l'application
        panel.classList.remove('show');
    });

    // Réinitialiser (supprimer la sauvegarde)
    document.getElementById('cb-btn-reset').addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        customData = null;
        inputTitre.value = ''; inputSousTitre.value = ''; inputBadge.value = ''; inputImage.value = ''; inputLien.value = '';
        alert("Données effacées ! Recharge la page pour retrouver la bannière originale.");
        panel.classList.remove('show');
    });

    // Fonction pour modifier la bannière sur la page
    function appliquerModifications(force = false) {
        if (!customData) return;

        const spotifyLogo = document.querySelector('img[src*="Spotify_Logo_CMYK_Green"]');
        if (!spotifyLogo) return;

        const banniere = spotifyLogo.closest('a');
        
        // Si déjà modifiée et qu'on ne force pas, on passe
        if (!banniere || (banniere.dataset.modifie && !force)) return; 

        if (customData.lien) banniere.href = customData.lien;

        const images = banniere.querySelectorAll('img');
        if (images.length > 0 && images[0] !== spotifyLogo && customData.image) {
            images[0].src = customData.image;
        }

        const titre = banniere.querySelector('h3');
        if (titre && customData.titre) titre.textContent = customData.titre;

        const sousTitre = banniere.querySelector('p');
        if (sousTitre && customData.sousTitre) sousTitre.textContent = customData.sousTitre;

        const spans = banniere.querySelectorAll('span');
        spans.forEach(span => {
            // Le code React original met "Featured + type"
            if (span.textContent.includes('Featured') && customData.badge) {
                span.textContent = customData.badge;
            }
        });

        banniere.dataset.modifie = "true";
    }

    // Observer pour détecter quand la bannière est chargée par React/Supabase
    const observer = new MutationObserver(() => {
        appliquerModifications();
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
