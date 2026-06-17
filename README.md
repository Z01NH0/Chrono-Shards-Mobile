# Chrono Shards — Mobile PWA

Jogo de sobrevivência com hordas, habilidades únicas, bosses e progressão permanente. Jogue diretamente no navegador ou instale como aplicativo Android via PWA.

---

## Como jogar

Acesse o jogo pelo navegador em:

```
https://chrono-shards-mobile.vercel.app/
```

---

## Instalação como App (Android / Chrome)

1. Abra o link acima no **Google Chrome** (Android ou Desktop).
2. Aguarde alguns segundos — um **banner de instalação** aparecerá na parte inferior da tela.
3. Clique em **"↓ Instalar"** no banner, ou no botão **"↓ Instalar App — Jogue Offline"** no menu principal.
4. O Chrome solicitará confirmação — aceite para instalar o app na tela inicial.
5. O jogo ficará disponível offline após a instalação.

---

## Gerar APK com PWABuilder

O repositório está configurado e pronto para ser processado pelo [PWABuilder](https://www.pwabuilder.com/).

### Passos

1. Acesse [pwabuilder.com](https://www.pwabuilder.com/).
2. Cole a URL do site: `https://chrono-shards-mobile.vercel.app/`
3. Clique em **"Start"** e aguarde a análise.
4. Selecione **Android** na lista de plataformas.
5. Clique em **"Generate Package"** para baixar o APK.
6. Instale o APK no dispositivo Android ou publique na Play Store.

---

## Estrutura do repositório

| Arquivo / Pasta | Descrição |
|---|---|
| `index.html` | Arquivo principal do jogo (monolítico) |
| `manifest.webmanifest` | Manifesto PWA completo (nome, ícones, display, screenshots) |
| `sw.js` | Service Worker com cache offline |
| `icons/` | Ícones PWA (192×192, 512×512, maskable, apple-touch) |
| `screenshots/` | Screenshots 1280×720 para a loja do PWABuilder |

---

## Checklist PWA

- [x] `manifest.webmanifest` com todos os campos obrigatórios
- [x] Ícone `any` 192×192
- [x] Ícone `any` 512×512
- [x] Ícone `maskable` 512×512
- [x] `apple-touch-icon` 180×180
- [x] Service Worker com cache offline
- [x] `display: fullscreen` para experiência imersiva
- [x] `orientation: landscape` para mobile
- [x] Screenshots `wide` 1280×720 (4 imagens)
- [x] Botão de instalação via `beforeinstallprompt`
- [x] Banner flutuante de instalação
- [x] Meta tags Open Graph
- [x] `prefer_related_applications: false`
- [x] `display_override` com fallback progressivo

---

## Tecnologias

- HTML5 Canvas (jogo)
- Vanilla JavaScript (sem frameworks)
- CSS3 com variáveis e media queries
- PWA (Service Worker + Web App Manifest)
