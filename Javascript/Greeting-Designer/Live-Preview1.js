(function () {
    "use strict";

    const GD = (window.GD = window.GD || {});

    function initPreviewIframe() {
        const { els } = GD;
        const doc = els.previewFrame.contentDocument;
        if (!doc) return;
        doc.open();
        doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style id="base-preview-reset">
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700;800&family=Cinzel:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@300;400;500;600;700&family=Merriweather:wght@300;400;700;800&family=Lora:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=EB+Garamond:wght@400;500;600;700;800&family=Bodoni+Moda:wght@400;500;600;700;800&family=Prata&family=Marcellus&family=Spectral:wght@300;400;600;700&family=Cardo:wght@400;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=Montserrat:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Raleway:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700;800&family=Quicksand:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700;800&family=Manrope:wght@300;400;500;600;700;800&family=Work+Sans:wght@300;400;500;600;700;800&family=Mulish:wght@300;400;500;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Rajdhani:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Syncopate:wght@400;700&family=Bebas+Neue&family=Abril+Fatface&family=Unbounded:wght@300;400;500;600;700;800&family=Press+Start+2P&family=Chakra+Petch:wght@300;400;500;600;700&family=Audiowide&family=Cinzel+Decorative:wght@400;700;900&family=Righteous&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@400;500;600;700&family=Alex+Brush&family=Parisienne&family=Sacramento&family=Satisfy&family=Caveat:wght@400;500;600;700&family=Allura&family=Tangerine:wght@400;700&family=Pacifico&family=Courgette&family=Kalam:wght@300;400;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Fira+Code:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&family=Source+Code+Pro:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');
  html, body {
    margin: 0;
    padding: 8px;
    background: #05060a;
    color: #e2e8f0;
    box-sizing: border-box;
    min-height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; }
  #b h2 { font-size: 22px; margin: 6px 0; }
  #b h3 { font-size: 16px; margin: 6px 0; opacity: 0.9; }
  #b b { font-weight: 700; }
</style>
<link id="bgfx-ext-css" rel="stylesheet" href="">
<link id="tpl-ext-css" rel="stylesheet" href="">
<style id="tpl-inline-css"></style>
</head>
<body>
  <div id="mount"></div>
</body>
</html>`);
        doc.close();
    }

        function renderPreviewFrame(tpl, mergedStyle, storyHtml, bgFxHref) {
        const { els, state } = GD;
        let frameDoc = els.previewFrame.contentDocument;
        if (!frameDoc || !frameDoc.getElementById("mount")) {
            initPreviewIframe();
            frameDoc = els.previewFrame.contentDocument;
        }
        if (!frameDoc) return;

        const bgFxLink = frameDoc.getElementById("bgfx-ext-css");
        const extLink = frameDoc.getElementById("tpl-ext-css");
        const inlineStyle = frameDoc.getElementById("tpl-inline-css");
        const mount = frameDoc.getElementById("mount");

        const targetFxHref = bgFxHref || "";
        if (bgFxLink && bgFxLink.getAttribute("href") !== targetFxHref) {
            bgFxLink.setAttribute("href", targetFxHref);
        }

        inlineStyle.textContent = mergedStyle;

        const leadHtml = tpl.prefixHtml || "";
        const tailHtml = tpl.extraHtml || "";
        const innerHtml = `${leadHtml}${storyHtml}${tailHtml}`;

        if (state.lastRenderedTemplateId !== tpl.id) {
            extLink.setAttribute("href", tpl.css);
            mount.innerHTML = `<div id="${tpl.outerId}"><div id="b">${innerHtml}</div></div>`;
            state.lastRenderedTemplateId = tpl.id;
        } else {
            const bEl = frameDoc.getElementById("b");
            if (bEl) {
                bEl.innerHTML = innerHtml;
            } else {
                mount.innerHTML = `<div id="${tpl.outerId}"><div id="b">${innerHtml}</div></div>`;
            }
        }
    }


    function updatePreviewMeta(tpl) {
        GD.els.previewActiveName.textContent = `• ${tpl.name}`;
    }

    function initLivePreview() {
        const { els } = GD;

        els.btnCompact.addEventListener("click", () => {
            els.previewWrap.classList.remove("expanded");
            els.btnExpand.classList.remove("active");
            const isNowCompact = els.previewWrap.classList.toggle("compact");
            els.btnCompact.classList.toggle("active", isNowCompact);
        });

        els.btnExpand.addEventListener("click", () => {
            els.previewWrap.classList.remove("compact");
            els.btnCompact.classList.remove("active");
            const isNowExpanded = els.previewWrap.classList.toggle("expanded");
            els.btnExpand.classList.toggle("active", isNowExpanded);
        });

        initPreviewIframe();
    }

    GD.preview = {
        initPreviewIframe,
        renderPreviewFrame,
        updatePreviewMeta,
        initLivePreview,
    };
})();
