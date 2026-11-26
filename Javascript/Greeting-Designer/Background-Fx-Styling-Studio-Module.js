(function () {
    "use strict";

    const GD = (window.GD = window.GD || {});

    const BG_FX_BASE_URL = "https://cdn.jsdelivr.net/gh/doratools/tools@main/Temp/BgFx/";

    const BG_FX_LIST = [
        { id: "1", name: "1. Soft Ambient Mesh", href: `${BG_FX_BASE_URL}1.css` },
        { id: "2", name: "2. Frosted Aurora", href: `${BG_FX_BASE_URL}2.css` },
        { id: "3", name: "3. Cyber Grid", href: `${BG_FX_BASE_URL}3.css` },
        { id: "4", name: "4. Neon Border Glow", href: `${BG_FX_BASE_URL}4.css` },
        { id: "5", name: "5. Dual Corner Orbs", href: `${BG_FX_BASE_URL}5.css` },
        { id: "6", name: "6. Diagonal Silk Ribbon", href: `${BG_FX_BASE_URL}6.css` },
        { id: "7", name: "7. Halftone Matrix", href: `${BG_FX_BASE_URL}7.css` },
        { id: "8", name: "8. Top Spotlight & Floor Bounce", href: `${BG_FX_BASE_URL}8.css` },
        { id: "9", name: "9. Glassmorphic Horizon", href: `${BG_FX_BASE_URL}9.css` },
        { id: "10", name: "10. Isometric Blueprint", href: `${BG_FX_BASE_URL}10.css` },
        { id: "11", name: "11. Subtle Scanlines", href: `${BG_FX_BASE_URL}11.css` },
        { id: "12", name: "12. Concentric Sonar Rings", href: `${BG_FX_BASE_URL}12.css` },
        { id: "13", name: "13. Chromatic Edge Vignette", href: `${BG_FX_BASE_URL}13.css` },
        { id: "14", name: "14. Geometric Split Beam", href: `${BG_FX_BASE_URL}14.css` },
        { id: "15", name: "15. Velvet Eclipse", href: `${BG_FX_BASE_URL}15.css` },
        { id: "16", name: "16. Minimalist Crosshairs", href: `${BG_FX_BASE_URL}16.css` },
        { id: "17", name: "17. Prismatic Refraction", href: `${BG_FX_BASE_URL}17.css` },
        { id: "18", name: "18. Frosted Diagonal Stripes", href: `${BG_FX_BASE_URL}18.css` },
        { id: "19", name: "19. Dual Floating Pills", href: `${BG_FX_BASE_URL}19.css` },
        { id: "20", name: "20. Luxury Etched Frame", href: `${BG_FX_BASE_URL}20.css` },
        { id: "21", name: "21. Corner Brackets", href: `${BG_FX_BASE_URL}21.css` },
        { id: "22", name: "22. Checkerboard Micro-Mesh", href: `${BG_FX_BASE_URL}22.css` },
        { id: "23", name: "23. Sunburst Rays", href: `${BG_FX_BASE_URL}23.css` },
        { id: "24", name: "24. Perspective Synth Floor", href: `${BG_FX_BASE_URL}24.css` },
        { id: "25", name: "25. Polka Bokeh", href: `${BG_FX_BASE_URL}25.css` },
        { id: "26", name: "26. Double Neon Underline", href: `${BG_FX_BASE_URL}26.css` },
        { id: "27", name: "27. Zig-Zag Chevron", href: `${BG_FX_BASE_URL}27.css` },
        { id: "28", name: "28. Vertical Light Pillars", href: `${BG_FX_BASE_URL}28.css` },
        { id: "29", name: "29. Diamond Lattice", href: `${BG_FX_BASE_URL}29.css` },
        { id: "30", name: "30. Gradient Frosted Pill Badge (Top-Right)", href: `${BG_FX_BASE_URL}30.css` },
        { id: "31", name: "31. Dual Crescent Moons", href: `${BG_FX_BASE_URL}31.css` },
        { id: "32", name: "32. Holographic Foil Sheen", href: `${BG_FX_BASE_URL}32.css` },
        { id: "33", name: "33. Topographic Contour Lines", href: `${BG_FX_BASE_URL}33.css` },
        { id: "34", name: "34. Glass Shards", href: `${BG_FX_BASE_URL}34.css` },
        { id: "35", name: "35. Dotted Matrix Fade", href: `${BG_FX_BASE_URL}35.css` },
        { id: "36", name: "36. Side Accent Bar + Glow", href: `${BG_FX_BASE_URL}36.css` },
        { id: "37", name: "37. Blurred Horizon Wave", href: `${BG_FX_BASE_URL}37.css` },
        { id: "38", name: "38. Subtle Graph Paper", href: `${BG_FX_BASE_URL}38.css` },
        { id: "39", name: "39. Center Aura Ring", href: `${BG_FX_BASE_URL}39.css` },
        { id: "40", name: "40. Gradient Noise Grain", href: `${BG_FX_BASE_URL}40.css` },
    ];

    const BG_FX_GROUPS = [
        {
            divider: "Selection",
            items: [{ label: "None", value: "" }],
        },
        {
            divider: "Background Fx (1 – 40)",
            items: BG_FX_LIST.map((item) => ({
                label: item.name,
                value: item.id,
            })),
        },
    ];

    function getSelectedBgFxItem() {
        const { state } = GD;
        if (!state.bgFxSelected) return null;
        return BG_FX_LIST.find((it) => it.id === state.bgFxSelected) || null;
    }

    function getBgFxOutput() {
        const { state, normalizeHex, validateImageLink } = GD;
        if (!state.studioEnabled || !state.bgFxEnabled) {
            return { linkTag: "", cssHref: "", topCssRule: "" };
        }

        const selectedItem = getSelectedBgFxItem();
        const hasEffectSelected = Boolean(selectedItem);

        const cssHref = hasEffectSelected ? selectedItem.href : "";
        const linkTag = cssHref ? `<link rel="stylesheet" href="${cssHref}">` : "";

        const cVars = [];
        if (hasEffectSelected) {
            const c1 = normalizeHex(state.bgFxColor1).toLowerCase();
            const c2 = normalizeHex(state.bgFxColor2).toLowerCase();
            cVars.push(`--c1:${c1};--c2:${c2};`);
        }

        if (state.bgImageEnabled) {
            const imgValidation = validateImageLink(state.bgImageUrl);
            const safeBgUrl = imgValidation.valid ? state.bgImageUrl.trim().replace(/['"\\]/g, "") : "";
            if (safeBgUrl) {
                cVars.push(`--bg:url('${safeBgUrl}');`);
            }
            const posChanged = Number(state.bgPosX) !== 50 || Number(state.bgPosY) !== 50;
            if (posChanged) {
                cVars.push(`--bgp:${Number(state.bgPosX)}% ${Number(state.bgPosY)}%;`);
            }
            if (Number(state.bgZoom) !== 100) {
                cVars.push(`--bgs:${Number(state.bgZoom)}%;`);
            }
        }

        const topCssRule = cVars.length > 0 ? `#c{${cVars.join("")}}` : "";

        return { linkTag, cssHref, topCssRule };
    }

    function resetBgFxToDefault() {
        const { state } = GD;
        state.bgFxSelected = "";
        state.bgFxColor1 = "#38BDF8";
        state.bgFxColor2 = "#A78BFA";
        state.bgImageEnabled = false;
        state.bgImageUrl = "";
        state.bgPosX = 50;
        state.bgPosY = 50;
        state.bgZoom = 100;
        syncBgFxControls();
    }

    function syncBgFxControls() {
        const { els, state, paintSwatchChip, updateSliderVisual, validateImageLink } = GD;

        els.bgFxToggle.checked = state.bgFxEnabled;
        els.bgFxToggleText.textContent = state.bgFxEnabled ? "On" : "Off";
        els.bgFxBody.classList.toggle("open", state.bgFxEnabled);

        const activeItem = getSelectedBgFxItem();
        els.bgFxSelectLabel.textContent = activeItem ? activeItem.name : "None";

        paintSwatchChip(els.bgFxColor1Chip, state.bgFxColor1);
        els.bgFxColor1Hex.textContent = state.bgFxColor1;

        paintSwatchChip(els.bgFxColor2Chip, state.bgFxColor2);
        els.bgFxColor2Hex.textContent = state.bgFxColor2;

        els.bgImageToggle.checked = state.bgImageEnabled;
        els.bgImageToggleText.textContent = state.bgImageEnabled ? "On" : "Off";
        els.bgImageBody.classList.toggle("open", state.bgImageEnabled);

        if (document.activeElement !== els.bgImageUrlInput) {
            els.bgImageUrlInput.value = state.bgImageUrl;
        }

        const imgRes = validateImageLink(state.bgImageUrl);
        const showImgError = state.bgImageEnabled && state.bgImageUrl.trim().length > 0 && !imgRes.valid;
        els.bgImageUrlInput.classList.toggle("invalid", showImgError);
        els.bgImageStatus.textContent = imgRes.message;
        els.bgImageStatus.classList.toggle("error", showImgError);
        els.bgImageStatus.classList.toggle("valid", state.bgImageEnabled && imgRes.valid);

        els.bgPosXSlider.value = state.bgPosX;
        if (Number(state.bgPosX) === 50) {
            els.bgPosXVal.textContent = "Off (50%)";
            els.bgPosXVal.classList.add("is-off");
        } else {
            els.bgPosXVal.textContent = `${state.bgPosX}%`;
            els.bgPosXVal.classList.remove("is-off");
        }
        updateSliderVisual(els.bgPosXSlider);

        els.bgPosYSlider.value = state.bgPosY;
        if (Number(state.bgPosY) === 50) {
            els.bgPosYVal.textContent = "Off (50%)";
            els.bgPosYVal.classList.add("is-off");
        } else {
            els.bgPosYVal.textContent = `${state.bgPosY}%`;
            els.bgPosYVal.classList.remove("is-off");
        }
        updateSliderVisual(els.bgPosYSlider);

        els.bgZoomSlider.value = state.bgZoom;
        if (Number(state.bgZoom) === 100) {
            els.bgZoomVal.textContent = "Off (100%)";
            els.bgZoomVal.classList.add("is-off");
        } else {
            els.bgZoomVal.textContent = `${state.bgZoom}%`;
            els.bgZoomVal.classList.remove("is-off");
        }
        updateSliderVisual(els.bgZoomSlider);
    }

    function initBgFx() {
        const { els, state, scheduleLiveUpdate, openCustomDropdown, showCustomDialog, stylingStudio } = GD;

        els.bgFxToggle.addEventListener("change", () => {
            state.bgFxEnabled = els.bgFxToggle.checked;
            els.bgFxToggleText.textContent = state.bgFxEnabled ? "On" : "Off";
            els.bgFxBody.classList.toggle("open", state.bgFxEnabled);
            scheduleLiveUpdate();
        });

        els.resetBgFxBtn.addEventListener("click", () => {
            showCustomDialog({
                title: "Reset Background Fx",
                message: "Reset Background Fx, Color 1 / Color 2, and Background Image settings back to default?",
                cancelText: "Cancel",
                confirmText: "Reset BgFx",
                onConfirm: () => {
                    resetBgFxToDefault();
                    scheduleLiveUpdate();
                },
            });
        });

        els.bgFxSelectBtn.addEventListener("click", () => {
            openCustomDropdown({
                title: "Select Background Fx",
                groups: BG_FX_GROUPS,
                currentValue: state.bgFxSelected,
                onSelect: (val) => {
                    state.bgFxSelected = val;
                    scheduleLiveUpdate();
                },
            });
        });

        els.bgFxColor1Btn.addEventListener("click", () => {
            stylingStudio.openColorPicker({
                title: "Background Fx — Color 1 (--c1)",
                initialHex: state.bgFxColor1,
                onApply: (hex) => {
                    state.bgFxColor1 = hex;
                    scheduleLiveUpdate();
                },
            });
        });

        els.bgFxColor2Btn.addEventListener("click", () => {
            stylingStudio.openColorPicker({
                title: "Background Fx — Color 2 (--c2)",
                initialHex: state.bgFxColor2,
                onApply: (hex) => {
                    state.bgFxColor2 = hex;
                    scheduleLiveUpdate();
                },
            });
        });

        els.bgImageToggle.addEventListener("change", () => {
            state.bgImageEnabled = els.bgImageToggle.checked;
            scheduleLiveUpdate();
        });

        els.bgImageUrlInput.addEventListener("input", () => {
            state.bgImageUrl = els.bgImageUrlInput.value;
            scheduleLiveUpdate();
        });

        els.bgPosXSlider.addEventListener("input", () => {
            state.bgPosX = Number(els.bgPosXSlider.value);
            scheduleLiveUpdate();
        });

        els.bgPosYSlider.addEventListener("input", () => {
            state.bgPosY = Number(els.bgPosYSlider.value);
            scheduleLiveUpdate();
        });

        els.bgZoomSlider.addEventListener("input", () => {
            state.bgZoom = Number(els.bgZoomSlider.value);
            scheduleLiveUpdate();
        });

        syncBgFxControls();
    }

    GD.bgFx = {
        BG_FX_LIST,
        getBgFxOutput,
        resetBgFxToDefault,
        syncBgFxControls,
        initBgFx,
    };
})();
