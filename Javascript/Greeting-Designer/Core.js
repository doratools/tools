(function () {
    "use strict";

    const GD = (window.GD = window.GD || {});

    const CHAR_LIMIT = 5750;
    const FAV_STORAGE_KEY = "greeting_designer_favourites_v1";

    const IMAGE_EXTENSIONS = new Set([
        "png",
        "jpg",
        "jpeg",
        "jpe",
        "jfif",
        "gif",
        "webp",
        "avif",
        "bmp",
        "dib",
        "svg",
        "svgz",
        "ico",
        "cur",
        "tif",
        "tiff",
        "heic",
        "heif",
        "apng",
    ]);

    const BLOCKED_MEDIA_EXTENSIONS = new Set([
        "mp4",
        "m4v",
        "webm",
        "mov",
        "avi",
        "mkv",
        "flv",
        "wmv",
        "3gp",
        "ogv",
        "mp3",
        "wav",
        "ogg",
        "aac",
        "m4a",
        "flac",
        "wma",
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "zip",
        "rar",
        "7z",
        "tar",
        "gz",
        "html",
        "htm",
        "php",
        "js",
        "css",
        "json",
        "xml",
        "txt",
    ]);

    const DEFAULT_STORY = [
        "# The Lantern at Midnight",
        "## Rain Against the Window",
        "*The brass bell above the quiet café door chimes softly as you step in from the storm, shaking cool droplets from your sleeves.*",
        "Across the dim room, she doesn't look up immediately. Instead, she slides a steaming ceramic mug toward the empty seat opposite hers.",
        '"You\'re seven minutes late," she murmurs, a **knowing smile** lingering at the edge of her voice. "I was starting to wonder if you\'d forgotten ***our midnight truce***."',
        "### Scene · Corner Booth · 12:07 AM",
    ].join("\n");

    const CATEGORIES = [
        { id: "All", icon: "✦", primary: true },
        { id: "Static", icon: "◆", primary: true },
        { id: "Animated", icon: "⚡", primary: true },
        { id: "Interactable", icon: "👆", primary: true },
        { id: "Classic Atelier", icon: "🏛️" },
        { id: "Custom & Workbench", icon: "🎨" },
        { id: "Story & Narrative", icon: "📖" },
        { id: "Dialogue & Chat", icon: "💬" },
        { id: "Game & RPG", icon: "🎮" },
        { id: "Tech & Sci-Fi", icon: "🛰️" },
        { id: "Fantasy & Magic", icon: "🔮" },
        { id: "Documents & Media", icon: "📰" },
        { id: "Horror & Dark", icon: "🕯️" },
        { id: "Style & Aesthetic", icon: "✨" },
        { id: "Romance", icon: "💗" },
        { id: "Slice of Life", icon: "☕" },
        { id: "Anime & Manga", icon: "🌸" },
        { id: "Elegant & Luxury", icon: "👑" },
        { id: "Retro & Arcade", icon: "🕹️" },
        { id: "Full Page Theme", icon: "🌐" },
    ];

    const FONT_GROUPS = [
        {
            divider: "Template Default",
            items: [{ label: "Default (Template)", value: "" }],
        },
        {
            divider: "Editorial & Luxury Serif",
            items: [
                { label: "Playfair Display", value: "'Playfair Display'" },
                { label: "Cinzel", value: "'Cinzel'" },
                { label: "Cormorant Garamond", value: "'Cormorant Garamond'" },
                { label: "Merriweather", value: "'Merriweather'" },
                { label: "Lora", value: "'Lora'" },
                { label: "Libre Baskerville", value: "'Libre Baskerville'" },
                { label: "EB Garamond", value: "'EB Garamond'" },
                { label: "Bodoni Moda", value: "'Bodoni Moda'" },
                { label: "Prata", value: "'Prata'" },
                { label: "Marcellus", value: "'Marcellus'" },
                { label: "Spectral", value: "'Spectral'" },
                { label: "Cardo", value: "'Cardo'" },
                { label: "Georgia", value: "Georgia" },
                { label: "Times New Roman", value: "'Times New Roman'" },
            ],
        },
        {
            divider: "Modern & Clean Sans-Serif",
            items: [
                { label: "Inter", value: "'Inter'" },
                { label: "Poppins", value: "'Poppins'" },
                { label: "Montserrat", value: "'Montserrat'" },
                { label: "Outfit", value: "'Outfit'" },
                { label: "Plus Jakarta Sans", value: "'Plus Jakarta Sans'" },
                { label: "Raleway", value: "'Raleway'" },
                { label: "DM Sans", value: "'DM Sans'" },
                { label: "Quicksand", value: "'Quicksand'" },
                { label: "Nunito", value: "'Nunito'" },
                { label: "Manrope", value: "'Manrope'" },
                { label: "Work Sans", value: "'Work Sans'" },
                { label: "Mulish", value: "'Mulish'" },
            ],
        },
        {
            divider: "Display, Sci-Fi & Dramatic",
            items: [
                { label: "Orbitron", value: "'Orbitron'" },
                { label: "Rajdhani", value: "'Rajdhani'" },
                { label: "Space Grotesk", value: "'Space Grotesk'" },
                { label: "Syncopate", value: "'Syncopate'" },
                { label: "Bebas Neue", value: "'Bebas Neue'" },
                { label: "Abril Fatface", value: "'Abril Fatface'" },
                { label: "Unbounded", value: "'Unbounded'" },
                { label: "Press Start 2P", value: "'Press Start 2P'" },
                { label: "Chakra Petch", value: "'Chakra Petch'" },
                { label: "Audiowide", value: "'Audiowide'" },
                { label: "Cinzel Decorative", value: "'Cinzel Decorative'" },
                { label: "Righteous", value: "'Righteous'" },
            ],
        },
        {
            divider: "Handwriting & Romantic Script",
            items: [
                { label: "Great Vibes", value: "'Great Vibes'" },
                { label: "Dancing Script", value: "'Dancing Script'" },
                { label: "Alex Brush", value: "'Alex Brush'" },
                { label: "Parisienne", value: "'Parisienne'" },
                { label: "Sacramento", value: "'Sacramento'" },
                { label: "Satisfy", value: "'Satisfy'" },
                { label: "Caveat", value: "'Caveat'" },
                { label: "Allura", value: "'Allura'" },
                { label: "Tangerine", value: "'Tangerine'" },
                { label: "Pacifico", value: "'Pacifico'" },
                { label: "Courgette", value: "'Courgette'" },
                { label: "Kalam", value: "'Kalam'" },
            ],
        },
        {
            divider: "Monospace & Terminal",
            items: [
                { label: "JetBrains Mono", value: "'JetBrains Mono'" },
                { label: "Fira Code", value: "'Fira Code'" },
                { label: "Space Mono", value: "'Space Mono'" },
                { label: "Source Code Pro", value: "'Source Code Pro'" },
                { label: "IBM Plex Mono", value: "'IBM Plex Mono'" },
                { label: "Courier New", value: "'Courier New'" },
            ],
        },
    ];

    const WEIGHT_OPTIONS = [
        { label: "Default", value: "" },
        { label: "Light (300)", value: "300" },
        { label: "Normal (400)", value: "400" },
        { label: "Medium (500)", value: "500" },
        { label: "Semi-Bold (600)", value: "600" },
        { label: "Bold (700)", value: "700" },
        { label: "Extra-Bold (800)", value: "800" },
    ];

    const ALIGN_OPTIONS = [
        { label: "Default", value: "" },
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
    ];

    const ELEMENT_LABELS = {
        h1: "h1 — Main Heading (#)",
        h2: "h2 — Subheading (##)",
        h3: "h3 — Small Heading (###)",
        p: "p — Paragraph Text",
    };

    function loadFavourites() {
        try {
            const saved = JSON.parse(localStorage.getItem(FAV_STORAGE_KEY) || "[]");
            return new Set(Array.isArray(saved) ? saved : []);
        } catch {
            return new Set();
        }
    }

    const state = {
        selectedId: "stat-1",
        activeCategory: "All",
        searchQuery: "",
        onlyFavourites: false,
        favourites: loadFavourites(),
        lastRenderedTemplateId: null,
        rafPending: false,
        searchTimer: null,
        studioEnabled: false,
        textStylesEnabled: false,
        targetEl: "h1",
        presentElements: ["h1", "h2", "h3", "p"],
        elementStyles: {},
        bgFxEnabled: false,
        bgFxSelected: "",
        bgFxColor1: "#38BDF8",
        bgFxColor2: "#A78BFA",
        bgImageEnabled: false,
        bgImageUrl: "",
        bgPosX: 50,
        bgPosY: 50,
        bgZoom: 100,
    };

    const els = {
        previewFrame: document.getElementById("previewFrame"),
        previewWrap: document.getElementById("previewWrap"),
        previewActiveName: document.getElementById("previewActiveName"),
        btnCompact: document.getElementById("btnCompact"),
        btnExpand: document.getElementById("btnExpand"),
        totalBadge: document.getElementById("totalBadge"),
        searchInput: document.getElementById("searchInput"),
        searchClear: document.getElementById("searchClear"),
        categoryList: document.getElementById("categoryList"),
        showingLabel: document.getElementById("showingLabel"),
        favFilterBtn: document.getElementById("favFilterBtn"),
        surpriseBtn: document.getElementById("surpriseBtn"),
        templateGrid: document.getElementById("templateGrid"),
        infoName: document.getElementById("infoName"),
        infoCats: document.getElementById("infoCats"),
        infoDesc: document.getElementById("infoDesc"),
        studioToggle: document.getElementById("studioToggle"),
        studioToggleText: document.getElementById("studioToggleText"),
        studioBody: document.getElementById("studioBody"),
        resetStudioBtn: document.getElementById("resetStudioBtn"),
        textStylesToggle: document.getElementById("textStylesToggle"),
        textStylesToggleText: document.getElementById("textStylesToggleText"),
        textStylesBody: document.getElementById("textStylesBody"),
        resetTextStylesBtn: document.getElementById("resetTextStylesBtn"),
        targetElBtn: document.getElementById("targetElBtn"),
        targetElLabel: document.getElementById("targetElLabel"),
        textColorBtn: document.getElementById("textColorBtn"),
        textColorChip: document.getElementById("textColorChip"),
        textColorHex: document.getElementById("textColorHex"),
        fontFamilyBtn: document.getElementById("fontFamilyBtn"),
        fontFamilyLabel: document.getElementById("fontFamilyLabel"),
        fontWeightBtn: document.getElementById("fontWeightBtn"),
        fontWeightLabel: document.getElementById("fontWeightLabel"),
        textAlignBtn: document.getElementById("textAlignBtn"),
        textAlignLabel: document.getElementById("textAlignLabel"),
        fontSizeSlider: document.getElementById("fontSizeSlider"),
        fontSizeVal: document.getElementById("fontSizeVal"),
        letterSpacingSlider: document.getElementById("letterSpacingSlider"),
        letterSpacingVal: document.getElementById("letterSpacingVal"),
        lineHeightSlider: document.getElementById("lineHeightSlider"),
        lineHeightVal: document.getElementById("lineHeightVal"),
        glowToggle: document.getElementById("glowToggle"),
        glowToggleText: document.getElementById("glowToggleText"),
        glowBody: document.getElementById("glowBody"),
        glowColorBtn: document.getElementById("glowColorBtn"),
        glowColorChip: document.getElementById("glowColorChip"),
        glowColorHex: document.getElementById("glowColorHex"),
        glowIntensitySlider: document.getElementById("glowIntensitySlider"),
        glowIntensityVal: document.getElementById("glowIntensityVal"),
        shadowToggle: document.getElementById("shadowToggle"),
        shadowToggleText: document.getElementById("shadowToggleText"),
        shadowBody: document.getElementById("shadowBody"),
        shadowColorBtn: document.getElementById("shadowColorBtn"),
        shadowColorChip: document.getElementById("shadowColorChip"),
        shadowColorHex: document.getElementById("shadowColorHex"),
        shadowIntensitySlider: document.getElementById("shadowIntensitySlider"),
        shadowIntensityVal: document.getElementById("shadowIntensityVal"),
        gradientToggle: document.getElementById("gradientToggle"),
        gradientToggleText: document.getElementById("gradientToggleText"),
        gradientBody: document.getElementById("gradientBody"),
        gradColor1Btn: document.getElementById("gradColor1Btn"),
        gradColor1Chip: document.getElementById("gradColor1Chip"),
        gradColor1Hex: document.getElementById("gradColor1Hex"),
        gradColor2Btn: document.getElementById("gradColor2Btn"),
        gradColor2Chip: document.getElementById("gradColor2Chip"),
        gradColor2Hex: document.getElementById("gradColor2Hex"),
        imageClipToggle: document.getElementById("imageClipToggle"),
        imageClipToggleText: document.getElementById("imageClipToggleText"),
        imageClipBody: document.getElementById("imageClipBody"),
        imageClipUrlInput: document.getElementById("imageClipUrlInput"),
        imageClipStatus: document.getElementById("imageClipStatus"),
        bgFxToggle: document.getElementById("bgFxToggle"),
        bgFxToggleText: document.getElementById("bgFxToggleText"),
        bgFxBody: document.getElementById("bgFxBody"),
        resetBgFxBtn: document.getElementById("resetBgFxBtn"),
        bgFxSelectBtn: document.getElementById("bgFxSelectBtn"),
        bgFxSelectLabel: document.getElementById("bgFxSelectLabel"),
        bgFxColor1Btn: document.getElementById("bgFxColor1Btn"),
        bgFxColor1Chip: document.getElementById("bgFxColor1Chip"),
        bgFxColor1Hex: document.getElementById("bgFxColor1Hex"),
        bgFxColor2Btn: document.getElementById("bgFxColor2Btn"),
        bgFxColor2Chip: document.getElementById("bgFxColor2Chip"),
        bgFxColor2Hex: document.getElementById("bgFxColor2Hex"),
        bgImageToggle: document.getElementById("bgImageToggle"),
        bgImageToggleText: document.getElementById("bgImageToggleText"),
        bgImageBody: document.getElementById("bgImageBody"),
        bgImageUrlInput: document.getElementById("bgImageUrlInput"),
        bgImageStatus: document.getElementById("bgImageStatus"),
        bgPosXSlider: document.getElementById("bgPosXSlider"),
        bgPosXVal: document.getElementById("bgPosXVal"),
        bgPosYSlider: document.getElementById("bgPosYSlider"),
        bgPosYVal: document.getElementById("bgPosYVal"),
        bgZoomSlider: document.getElementById("bgZoomSlider"),
        bgZoomVal: document.getElementById("bgZoomVal"),
        storyInput: document.getElementById("storyInput"),
        resetStoryBtn: document.getElementById("resetStoryBtn"),
        clearStoryBtn: document.getElementById("clearStoryBtn"),
        codePanel: document.getElementById("codePanel"),
        charCounter: document.getElementById("charCounter"),
        copyCodeBtn: document.getElementById("copyCodeBtn"),
        limitWarningDrawer: document.getElementById("limitWarningDrawer"),
        codeOutput: document.getElementById("codeOutput"),
        dropdownModal: document.getElementById("dropdownModal"),
        dropdownModalTitle: document.getElementById("dropdownModalTitle"),
        dropdownCloseBtn: document.getElementById("dropdownCloseBtn"),
        dropdownModalList: document.getElementById("dropdownModalList"),
        colorPickerModal: document.getElementById("colorPickerModal"),
        cpModalTitle: document.getElementById("cpModalTitle"),
        cpCloseX: document.getElementById("cpCloseX"),
        cpShadesRow: document.getElementById("cpShadesRow"),
        cpSvBox: document.getElementById("cpSvBox"),
        cpSvCursor: document.getElementById("cpSvCursor"),
        cpHueBar: document.getElementById("cpHueBar"),
        cpHueThumb: document.getElementById("cpHueThumb"),
        cpAlphaBar: document.getElementById("cpAlphaBar"),
        cpAlphaGrad: document.getElementById("cpAlphaGrad"),
        cpAlphaThumb: document.getElementById("cpAlphaThumb"),
        cpAlphaPct: document.getElementById("cpAlphaPct"),
        cpPreviewFill: document.getElementById("cpPreviewFill"),
        cpHexInput: document.getElementById("cpHexInput"),
        cpCancelBtn: document.getElementById("cpCancelBtn"),
        cpApplyBtn: document.getElementById("cpApplyBtn"),
        alertModal: document.getElementById("alertModal"),
        alertModalTitle: document.getElementById("alertModalTitle"),
        alertCloseX: document.getElementById("alertCloseX"),
        alertModalMsg: document.getElementById("alertModalMsg"),
        alertModalFooter: document.getElementById("alertModalFooter"),
    };

    function validateImageLink(rawUrl) {
        const trimmed = (rawUrl || "").trim();
        if (!trimmed) {
            return {
                valid: false,
                reason: "empty",
                message: "Paste a direct image or GIF link (PNG, JPG, JPEG, GIF, WEBP, AVIF, SVG...).",
            };
        }

        if (/^data:image\/([a-z0-9.+-]+);base64,/i.test(trimmed)) {
            const sub = trimmed.match(/^data:image\/([a-z0-9.+-]+);base64,/i)[1].toLowerCase();
            if (BLOCKED_MEDIA_EXTENSIONS.has(sub)) {
                return { valid: false, reason: "blocked", message: `Rejected: "${sub}" format is not supported.` };
            }
            return { valid: true, reason: "ok", message: `Image valid (${sub.toUpperCase()}).` };
        }

        let parsed;
        try {
            parsed = new URL(trimmed);
        } catch {
            return { valid: false, reason: "invalid_url", message: "Invalid link. Enter a valid http(s):// image or GIF URL." };
        }

        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
            return { valid: false, reason: "protocol", message: "Only http:// or https:// image links are allowed." };
        }

        const pathLower = parsed.pathname.toLowerCase();
        const extMatch = pathLower.match(/\.([a-z0-9]+)$/);
        const ext = extMatch ? extMatch[1] : "";

        if (ext && BLOCKED_MEDIA_EXTENSIONS.has(ext)) {
            return {
                valid: false,
                reason: "blocked_type",
                message: `Rejected ".${ext}" file. Only image & GIF formats (PNG, JPG, JPEG, GIF, WEBP, etc.) are allowed.`,
            };
        }

        const queryFmt = (
            parsed.searchParams.get("format") ||
            parsed.searchParams.get("fm") ||
            parsed.searchParams.get("ext") ||
            ""
        ).toLowerCase();
        if (queryFmt && BLOCKED_MEDIA_EXTENSIONS.has(queryFmt)) {
            return {
                valid: false,
                reason: "blocked_query",
                message: `Rejected "${queryFmt}" format. Only image & GIF formats are allowed.`,
            };
        }

        if (ext && IMAGE_EXTENSIONS.has(ext)) {
            return { valid: true, reason: "ok", message: `Image valid (.${ext.toUpperCase()}).` };
        }

        if (queryFmt && IMAGE_EXTENSIONS.has(queryFmt)) {
            return { valid: true, reason: "ok", message: `Image valid (${queryFmt.toUpperCase()}).` };
        }

        if (!ext) {
            return { valid: true, reason: "ok", message: "Image URL accepted." };
        }

        return {
            valid: false,
            reason: "unknown_ext",
            message: `Rejected ".${ext}". Use an image or GIF link (PNG, JPG, JPEG, GIF, WEBP, AVIF, SVG, etc.).`,
        };
    }

    function saveFavourites() {
        try {
            localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify([...state.favourites]));
        } catch {}
    }

    function normalizeHex(hex) {
        if (!hex) return "#FFFFFF";
        let h = hex.trim().replace(/^#/, "").toUpperCase();
        if (h.length === 3) {
            h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        } else if (h.length === 4) {
            h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
        }
        if (!/^[0-9A-F]{6}([0-9A-F]{2})?$/.test(h)) return "#FFFFFF";
        return "#" + h;
    }

    function paintSwatchChip(chipEl, hexVal) {
        if (!chipEl) return;
        const norm = normalizeHex(hexVal);
        chipEl.style.backgroundImage = "none";
        chipEl.style.backgroundColor = norm;
    }

    function hexToHsva(hexStr) {
        const norm = normalizeHex(hexStr);
        const r = parseInt(norm.slice(1, 3), 16) / 255;
        const g = parseInt(norm.slice(3, 5), 16) / 255;
        const b = parseInt(norm.slice(5, 7), 16) / 255;
        const a = norm.length === 9 ? parseInt(norm.slice(7, 9), 16) / 255 : 1;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        let h = 0;
        const s = max === 0 ? 0 : d / max;
        const v = max;

        if (max !== min) {
            if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h *= 60;
        }
        return { h: Math.round(h), s, v, a };
    }

    function hsvaToHex(h, s, v, a) {
        const c = v * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = v - c;
        let r1 = 0,
            g1 = 0,
            b1 = 0;
        if (h >= 0 && h < 60) {
            r1 = c;
            g1 = x;
        } else if (h >= 60 && h < 120) {
            r1 = x;
            g1 = c;
        } else if (h >= 120 && h < 180) {
            g1 = c;
            b1 = x;
        } else if (h >= 180 && h < 240) {
            g1 = x;
            b1 = c;
        } else if (h >= 240 && h < 300) {
            r1 = x;
            b1 = c;
        } else {
            r1 = c;
            b1 = x;
        }
        const toByte = (n) =>
            Math.round((n + m) * 255)
                .toString(16)
                .padStart(2, "0")
                .toUpperCase();
        const rgbHex = `#${toByte(r1)}${toByte(g1)}${toByte(b1)}`;
        const alphaByte = Math.round(Math.max(0, Math.min(1, a)) * 255);
        if (alphaByte >= 255) return rgbHex;
        return rgbHex + alphaByte.toString(16).padStart(2, "0").toUpperCase();
    }

    function parseTemplateRules(cssText) {
        const order = [];
        const map = new Map();
        const regex = /([^{}]+)\{([^{}]*)\}/g;
        let match;
        while ((match = regex.exec(cssText)) !== null) {
            const selector = match[1].trim().replace(/\s+/g, " ");
            const body = match[2].trim();
            const props = [];
            body.split(";").forEach((decl) => {
                const idx = decl.indexOf(":");
                if (idx === -1) return;
                const k = decl.slice(0, idx).trim().toLowerCase();
                const v = decl.slice(idx + 1).trim();
                if (k && v) {
                    const existing = props.find((p) => p.key === k);
                    if (existing) existing.val = v;
                    else props.push({ key: k, val: v });
                }
            });
            if (!map.has(selector)) order.push(selector);
            map.set(selector, props);
        }
        return { order, map };
    }

    function computeHeadingComplementColor(tpl) {
        const parsed = parseTemplateRules(tpl.style);
        const usedColors = new Set();
        let baseHex = "#E2D2FF";

        parsed.map.forEach((props, sel) => {
            const cProp = props.find((p) => p.key === "color");
            if (cProp) {
                const norm = normalizeHex(cProp.val);
                usedColors.add(norm.slice(0, 7));
                if (sel === "#b h1") baseHex = norm.slice(0, 7);
            }
        });

        const hsv = hexToHsva(baseHex);
        const candidateShifts = [34, -34, 52, -52, 75, 145];
        for (const shift of candidateShifts) {
            const candH = (hsv.h + shift + 360) % 360;
            const candS = Math.max(0.32, Math.min(0.88, hsv.s));
            const candV = Math.max(0.82, Math.min(0.98, hsv.v));
            const candHex = hsvaToHex(candH, candS, candV, 1);
            if (!usedColors.has(candHex)) return candHex;
        }
        return "#7DD3FC";
    }

    function getTemplateBaseForTag(tpl, tag) {
        const parsed = parseTemplateRules(tpl.style);
        const sel = `#b ${tag}`;
        const props = parsed.map.get(sel) || [];
        const colorProp = props.find((p) => p.key === "color");
        const sizeProp = props.find((p) => p.key === "font-size");

        let defaultColor = colorProp ? normalizeHex(colorProp.val) : null;
        if (!defaultColor && (tag === "h2" || tag === "h3")) {
            defaultColor = computeHeadingComplementColor(tpl);
        }
        if (!defaultColor) defaultColor = "#E2E8F0";

        const defaultSizes = { h1: 34, h2: 23, h3: 17, p: 14 };
        const parsedSize = sizeProp ? parseFloat(sizeProp.val) : defaultSizes[tag];

        return {
            hasOriginalRule: parsed.map.has(sel),
            hasOriginalColor: Boolean(colorProp),
            color: defaultColor,
            fontSize: Number.isFinite(parsedSize) ? parsedSize : defaultSizes[tag],
        };
    }

    function getSelectedTemplate() {
        return GD.TEMPLATES.find((t) => t.id === state.selectedId) || GD.TEMPLATES[0];
    }

    function buildTemplateCode(tpl, mergedStyle, storyHtml, bgFxData) {
        const fx = bgFxData || { linkTag: "", topCssRule: "" };
        const prefixLink = fx.linkTag ? `${fx.linkTag}\n` : "";
        const topRule = fx.topCssRule ? `${fx.topCssRule}\n` : "";
        return (
            `${prefixLink}<link rel="stylesheet" href="${tpl.css}">\n` +
            `<style>\n${topRule}${mergedStyle}\n</style>\n` +
            `<div id="${tpl.outerId}"><div id="b">${storyHtml}${tpl.extraHtml}</div></div>`
        );
    }

    function updateSliderVisual(slider) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const val = parseFloat(slider.value);
        const pct = ((val - min) / (max - min)) * 100;
        slider.style.setProperty("--fill", `${pct}%`);
    }

    function updateLiveOutput() {
        const tpl = getSelectedTemplate();
        const { html: storyHtml, presentElements } = GD.formatter.formatStoryAndDetectElements(els.storyInput.value);

        GD.textStyles.syncTargetElementDropdown(presentElements);
        GD.textStyles.syncStudioControlsToTarget();

        if (GD.bgFx && typeof GD.bgFx.syncBgFxControls === "function") {
            GD.bgFx.syncBgFxControls();
        }

        const mergedStyle = GD.textStyles.buildMergedInternalCss(tpl, presentElements);
        const bgFxData =
            GD.bgFx && typeof GD.bgFx.getBgFxOutput === "function"
                ? GD.bgFx.getBgFxOutput()
                : { linkTag: "", cssHref: "", topCssRule: "" };

        const fullCode = buildTemplateCode(tpl, mergedStyle, storyHtml, bgFxData);

        els.codeOutput.value = fullCode;
        const len = fullCode.length;
        els.charCounter.textContent = `${len} / ${CHAR_LIMIT}`;
        const isOver = len > CHAR_LIMIT;
        els.charCounter.classList.toggle("over-limit", isOver);
        els.codePanel.classList.toggle("over-limit", isOver);
        els.limitWarningDrawer.classList.toggle("visible", isOver);

        if (GD.preview && typeof GD.preview.updatePreviewMeta === "function") {
            GD.preview.updatePreviewMeta(tpl);
        } else {
            els.previewActiveName.textContent = `• ${tpl.name}`;
        }

        els.infoName.textContent = tpl.name;
        els.infoCats.textContent = `· ${tpl.categories.join(" · ")}`;
        els.infoDesc.textContent = tpl.desc;

        if (GD.preview && typeof GD.preview.renderPreviewFrame === "function") {
            GD.preview.renderPreviewFrame(
                tpl,
                `${bgFxData.topCssRule ? bgFxData.topCssRule + "\n" : ""}${mergedStyle}`,
                storyHtml,
                bgFxData.cssHref
            );
        }
    }

    function scheduleLiveUpdate() {
        if (state.rafPending) return;
        state.rafPending = true;
        requestAnimationFrame(() => {
            state.rafPending = false;
            updateLiveOutput();
        });
    }

    function openCustomDropdown({ title, groups, currentValue, onSelect }) {
        els.dropdownModalTitle.textContent = title;
        const frag = document.createDocumentFragment();

        groups.forEach((group) => {
            if (group.divider) {
                const div = document.createElement("div");
                div.className = "dd-divider";
                div.textContent = group.divider;
                frag.appendChild(div);
            }
            group.items.forEach((item) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "dd-option" + (item.value === currentValue ? " active" : "");
                if (item.value && title === "Select Font Family") {
                    btn.style.fontFamily = item.value;
                }
                const spanText = document.createElement("span");
                spanText.textContent = item.label;
                btn.appendChild(spanText);

                if (item.value === currentValue) {
                    const check = document.createElement("span");
                    check.textContent = "✓";
                    btn.appendChild(check);
                }

                btn.addEventListener("click", () => {
                    els.dropdownModal.classList.remove("open");
                    onSelect(item.value);
                });
                frag.appendChild(btn);
            });
        });

        els.dropdownModalList.replaceChildren(frag);
        els.dropdownModal.classList.add("open");
    }

    function showCustomDialog({ title, message, confirmText, cancelText, onConfirm }) {
        els.alertModalTitle.textContent = title || "Notice";
        els.alertModalMsg.textContent = message;
        const frag = document.createDocumentFragment();

        if (cancelText) {
            const cancelBtn = document.createElement("button");
            cancelBtn.type = "button";
            cancelBtn.className = "mini-btn";
            cancelBtn.textContent = cancelText;
            cancelBtn.addEventListener("click", () => els.alertModal.classList.remove("open"));
            frag.appendChild(cancelBtn);
        }

        const okBtn = document.createElement("button");
        okBtn.type = "button";
        okBtn.className = "copy-btn";
        okBtn.textContent = confirmText || "OK";
        okBtn.addEventListener("click", () => {
            els.alertModal.classList.remove("open");
            if (onConfirm) onConfirm();
        });
        frag.appendChild(okBtn);

        els.alertModalFooter.replaceChildren(frag);
        els.alertModal.classList.add("open");
    }

    function getFilteredTemplates() {
        const q = state.searchQuery.trim().toLowerCase();
        return GD.TEMPLATES.filter((tpl) => {
            if (state.onlyFavourites && !state.favourites.has(tpl.id)) return false;
            if (state.activeCategory !== "All" && !tpl.categories.includes(state.activeCategory)) {
                return false;
            }
            if (q) {
                const hay = `${tpl.name} ${tpl.desc} ${tpl.type} ${tpl.categories.join(" ")}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }

    function renderCategories() {
        const frag = document.createDocumentFragment();
        CATEGORIES.forEach((cat) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className =
                "cat-pill" +
                (cat.primary ? " primary-type" : "") +
                (state.activeCategory === cat.id ? " active" : "");
            btn.textContent = `${cat.icon} ${cat.id}`;
            btn.dataset.cat = cat.id;
            frag.appendChild(btn);
        });
        els.categoryList.replaceChildren(frag);
    }

    function renderTemplates() {
        const filtered = getFilteredTemplates();
        els.totalBadge.textContent = `${GD.TEMPLATES.length} templates`;
        els.showingLabel.textContent = `${filtered.length} of ${GD.TEMPLATES.length} templates`;

        if (filtered.length === 0) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent = state.onlyFavourites
                ? "No favourite templates match your current filter. Tap ★ on any template to save it."
                : `No templates in "${state.activeCategory}" match your search yet.`;
            els.templateGrid.replaceChildren(empty);
            return;
        }

        const frag = document.createDocumentFragment();
        filtered.forEach((tpl) => {
            const card = document.createElement("div");
            card.className = "tpl-card" + (tpl.id === state.selectedId ? " selected" : "");
            card.dataset.id = tpl.id;
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");

            const isFav = state.favourites.has(tpl.id);

            const swatch = document.createElement("div");
            swatch.className = "tpl-swatch";
            swatch.style.background = tpl.swatch;

            const tag = document.createElement("span");
            tag.className = "tpl-type-tag";
            tag.textContent = tpl.type;

            const favBtn = document.createElement("button");
            favBtn.type = "button";
            favBtn.className = "tpl-fav-btn" + (isFav ? " faved" : "");
            favBtn.dataset.favId = tpl.id;
            favBtn.setAttribute("aria-label", "Toggle Favourite");
            favBtn.textContent = "★";

            const nameEl = document.createElement("div");
            nameEl.className = "tpl-name";
            nameEl.textContent = tpl.name;

            const descEl = document.createElement("div");
            descEl.className = "tpl-desc-mini";
            descEl.textContent = tpl.desc;

            swatch.append(tag, favBtn);
            card.append(swatch, nameEl, descEl);
            frag.appendChild(card);
        });

        els.templateGrid.replaceChildren(frag);
    }

    function selectTemplateById(id) {
        state.selectedId = id;
        const tpl = getSelectedTemplate();
        ["h1", "h2", "h3", "p"].forEach((tag) => {
            if (state.elementStyles[tag]) {
                const base = getTemplateBaseForTag(tpl, tag);
                if (!state.elementStyles[tag].colorChanged) {
                    state.elementStyles[tag].color = base.color;
                }
                if (!state.elementStyles[tag].fontSizeChanged) {
                    state.elementStyles[tag].fontSize = base.fontSize;
                }
            }
        });
        renderTemplates();
        scheduleLiveUpdate();
    }

    function fallbackCopy(callback) {
        els.codeOutput.focus();
        els.codeOutput.select();
        try {
            document.execCommand("copy");
            callback();
        } catch {}
    }

    function copyGeneratedCode() {
        const text = els.codeOutput.value;
        const onSuccess = () => {
            els.copyCodeBtn.textContent = "✓ Copied!";
            els.copyCodeBtn.classList.add("copied");
            setTimeout(() => {
                els.copyCodeBtn.textContent = "Copy Code";
                els.copyCodeBtn.classList.remove("copied");
            }, 1600);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
                .writeText(text)
                .then(onSuccess)
                .catch(() => fallbackCopy(onSuccess));
        } else {
            fallbackCopy(onSuccess);
        }
    }

    function bindCoreEvents() {
        els.dropdownCloseBtn.addEventListener("click", () => els.dropdownModal.classList.remove("open"));
        els.dropdownModal.addEventListener("click", (e) => {
            if (e.target === els.dropdownModal) els.dropdownModal.classList.remove("open");
        });

        els.alertCloseX.addEventListener("click", () => els.alertModal.classList.remove("open"));
        els.alertModal.addEventListener("click", (e) => {
            if (e.target === els.alertModal) els.alertModal.classList.remove("open");
        });

        els.categoryList.addEventListener("click", (e) => {
            const btn = e.target.closest(".cat-pill");
            if (!btn || !btn.dataset.cat) return;
            state.activeCategory = btn.dataset.cat;
            renderCategories();
            renderTemplates();
        });

        els.templateGrid.addEventListener("click", (e) => {
            const favBtn = e.target.closest(".tpl-fav-btn");
            if (favBtn && favBtn.dataset.favId) {
                e.stopPropagation();
                const id = favBtn.dataset.favId;
                if (state.favourites.has(id)) {
                    state.favourites.delete(id);
                } else {
                    state.favourites.add(id);
                }
                saveFavourites();
                renderTemplates();
                return;
            }

            const card = e.target.closest(".tpl-card");
            if (!card || !card.dataset.id) return;
            selectTemplateById(card.dataset.id);
        });

        els.templateGrid.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            const card = e.target.closest(".tpl-card");
            if (!card || !card.dataset.id) return;
            e.preventDefault();
            selectTemplateById(card.dataset.id);
        });

        els.storyInput.addEventListener("input", scheduleLiveUpdate);

        els.searchInput.addEventListener("input", () => {
            const val = els.searchInput.value;
            els.searchClear.classList.toggle("visible", val.length > 0);
            clearTimeout(state.searchTimer);
            state.searchTimer = setTimeout(() => {
                state.searchQuery = val;
                renderTemplates();
            }, 90);
        });

        els.searchClear.addEventListener("click", () => {
            clearTimeout(state.searchTimer);
            els.searchInput.value = "";
            state.searchQuery = "";
            els.searchClear.classList.remove("visible");
            renderTemplates();
            els.searchInput.focus();
        });

        els.favFilterBtn.addEventListener("click", () => {
            state.onlyFavourites = !state.onlyFavourites;
            els.favFilterBtn.classList.toggle("active", state.onlyFavourites);
            renderTemplates();
        });

        els.surpriseBtn.addEventListener("click", () => {
            const pool = getFilteredTemplates();
            const list = pool.length ? pool : GD.TEMPLATES;
            const pick = list[Math.floor(Math.random() * list.length)];
            selectTemplateById(pick.id);
        });

        els.resetStoryBtn.addEventListener("click", () => {
            els.storyInput.value = DEFAULT_STORY;
            scheduleLiveUpdate();
        });

        els.clearStoryBtn.addEventListener("click", () => {
            els.storyInput.value = "";
            scheduleLiveUpdate();
            els.storyInput.focus();
        });

        els.copyCodeBtn.addEventListener("click", copyGeneratedCode);
    }

    function init() {
        state.selectedId = GD.TEMPLATES[0].id;
        bindCoreEvents();
        if (GD.preview && typeof GD.preview.initLivePreview === "function") {
            GD.preview.initLivePreview();
        }
        if (GD.stylingStudio && typeof GD.stylingStudio.initStylingStudio === "function") {
            GD.stylingStudio.initStylingStudio();
        }
        if (GD.textStyles && typeof GD.textStyles.initTextStyles === "function") {
            GD.textStyles.initTextStyles();
        }
        if (GD.bgFx && typeof GD.bgFx.initBgFx === "function") {
            GD.bgFx.initBgFx();
        }
        els.storyInput.value = DEFAULT_STORY;
        renderCategories();
        renderTemplates();
        updateLiveOutput();
    }

    Object.assign(GD, {
        CHAR_LIMIT,
        FAV_STORAGE_KEY,
        DEFAULT_STORY,
        CATEGORIES,
        FONT_GROUPS,
        WEIGHT_OPTIONS,
        ALIGN_OPTIONS,
        ELEMENT_LABELS,
        state,
        els,
        validateImageLink,
        normalizeHex,
        paintSwatchChip,
        hexToHsva,
        hsvaToHex,
        parseTemplateRules,
        computeHeadingComplementColor,
        getTemplateBaseForTag,
        getSelectedTemplate,
        buildTemplateCode,
        updateSliderVisual,
        updateLiveOutput,
        scheduleLiveUpdate,
        openCustomDropdown,
        showCustomDialog,
        init,
    });
})();
