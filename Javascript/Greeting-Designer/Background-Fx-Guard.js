(function () {
    "use strict";

    const GD = (window.GD = window.GD || {});
    const BAN_MESSAGE = "Background Fx not applicable on animated templates";

    function isAnimatedTemplate(tpl) {
        if (!tpl) return false;
        if (String(tpl.type || "").toLowerCase() === "animated") return true;
        return Array.isArray(tpl.categories) && tpl.categories.some((c) => String(c).toLowerCase() === "animated");
    }

    function ensureBannerAndStyles() {
        if (!document.getElementById("gd-bgfx-guard-style")) {
            const style = document.createElement("style");
            style.id = "gd-bgfx-guard-style";
            style.textContent = `
                .bgfx-guard-locked {
                    opacity: 0.42 !important;
                    filter: grayscale(0.85);
                    pointer-events: none !important;
                    user-select: none;
                    transition: opacity 0.2s ease, filter 0.2s ease;
                }
                .bgfx-guard-banner {
                    display: none;
                    font-size: 11.5px;
                    font-weight: 600;
                    color: #fbbf24;
                    background: rgba(251, 191, 36, 0.1);
                    border: 1px solid rgba(251, 191, 36, 0.32);
                    border-radius: 9px;
                    padding: 8px 11px;
                }
                .bgfx-guard-banner.visible {
                    display: block;
                }
            `;
            document.head.appendChild(style);
        }

        const { els } = GD;
        if (!els || !els.bgFxBody) return null;
        const inner = els.bgFxBody.querySelector(".collapse-inner");
        if (!inner) return null;

        let banner = document.getElementById("bgFxGuardBanner");
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "bgFxGuardBanner";
            banner.className = "bgfx-guard-banner";
            banner.textContent = BAN_MESSAGE;
            inner.insertBefore(banner, inner.firstChild);
        }
        return banner;
    }

    function syncGuardUI() {
        const { els, getSelectedTemplate } = GD;
        if (!els || !els.bgFxSelectBtn || typeof getSelectedTemplate !== "function") return;

        const banner = ensureBannerAndStyles();
        const blocked = isAnimatedTemplate(getSelectedTemplate());

        const selectField = els.bgFxSelectBtn.closest(".field-block");
        const colorGrid = els.bgFxColor1Btn ? els.bgFxColor1Btn.closest(".ctrl-grid-2") : null;

        if (selectField) selectField.classList.toggle("bgfx-guard-locked", blocked);
        if (colorGrid) colorGrid.classList.toggle("bgfx-guard-locked", blocked);

        els.bgFxSelectBtn.disabled = blocked;
        if (els.bgFxColor1Btn) els.bgFxColor1Btn.disabled = blocked;
        if (els.bgFxColor2Btn) els.bgFxColor2Btn.disabled = blocked;

        if (banner) {
            banner.classList.toggle("visible", blocked);
        }
    }

    function installGuard() {
        if (!GD.bgFx || GD.bgFx.__guardInstalled) return;
        GD.bgFx.__guardInstalled = true;

        const origGetBgFxOutput = GD.bgFx.getBgFxOutput;
        const origSyncBgFxControls = GD.bgFx.syncBgFxControls;
        const origInitBgFx = GD.bgFx.initBgFx;

        // Strip BgFx effect link & --c1/--c2 variables on Animated templates while keeping Background Image intact
        GD.bgFx.getBgFxOutput = function () {
            const { state, getSelectedTemplate, normalizeHex, validateImageLink } = GD;
            if (!state.studioEnabled || !state.bgFxEnabled) {
                return { linkTag: "", cssHref: "", topCssRule: "" };
            }

            if (isAnimatedTemplate(getSelectedTemplate())) {
                const cVars = [];
                if (state.bgImageEnabled) {
                    const imgValidation = validateImageLink(state.bgImageUrl);
                    const safeBgUrl = imgValidation.valid ? state.bgImageUrl.trim().replace(/['"\\]/g, "") : "";
                    if (safeBgUrl) {
                        cVars.push(`--bg:url('${safeBgUrl}');`);
                    }
                    if (Number(state.bgPosX) !== 50 || Number(state.bgPosY) !== 50) {
                        cVars.push(`--bgp:${Number(state.bgPosX)}% ${Number(state.bgPosY)}%;`);
                    }
                    if (Number(state.bgZoom) !== 100) {
                        cVars.push(`--bgs:${Number(state.bgZoom)}%;`);
                    }
                }
                return {
                    linkTag: "",
                    cssHref: "",
                    topCssRule: cVars.length > 0 ? `#c{${cVars.join("")}}` : "",
                };
            }

            return origGetBgFxOutput.apply(this, arguments);
        };

        GD.bgFx.syncBgFxControls = function () {
            origSyncBgFxControls.apply(this, arguments);
            syncGuardUI();
        };

        GD.bgFx.initBgFx = function () {
            origInitBgFx.apply(this, arguments);
            syncGuardUI();
        };

        // Block opening the BgFx selector modal if triggered while on an Animated template
        if (GD.els && GD.els.bgFxSelectBtn) {
            GD.els.bgFxSelectBtn.addEventListener(
                "click",
                (e) => {
                    if (isAnimatedTemplate(GD.getSelectedTemplate())) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                },
                true
            );
        }

        syncGuardUI();
    }

    if (GD.bgFx) {
        installGuard();
    } else {
        window.addEventListener("DOMContentLoaded", installGuard);
    }

    GD.bgFxGuard = {
        BAN_MESSAGE,
        isAnimatedTemplate,
        syncGuardUI,
        installGuard,
    };
})();
