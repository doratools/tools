(function () {
    "use strict";

    const GD = (window.GD = window.GD || {});

    const cpState = {
        h: 200,
        s: 0.77,
        v: 0.97,
        a: 1,
        onApply: null,
    };

    function renderColorPickerUI() {
        const { els, hsvaToHex, hexToHsva, paintSwatchChip } = GD;
        const pureHueHex = hsvaToHex(cpState.h, 1, 1, 1);
        const solidHex = hsvaToHex(cpState.h, cpState.s, cpState.v, 1);
        const fullHex = hsvaToHex(cpState.h, cpState.s, cpState.v, cpState.a);

        els.cpSvBox.style.backgroundColor = pureHueHex;
        els.cpSvCursor.style.left = `${cpState.s * 100}%`;
        els.cpSvCursor.style.top = `${(1 - cpState.v) * 100}%`;

        els.cpHueThumb.style.left = `${(cpState.h / 360) * 100}%`;
        els.cpAlphaGrad.style.background = `linear-gradient(to right, transparent, ${solidHex})`;
        els.cpAlphaThumb.style.left = `${cpState.a * 100}%`;
        els.cpAlphaPct.textContent = `${Math.round(cpState.a * 100)}%`;

        paintSwatchChip(els.cpPreviewFill, fullHex);
        if (document.activeElement !== els.cpHexInput) {
            els.cpHexInput.value = fullHex;
        }

        const frag = document.createDocumentFragment();
        for (let i = 0; i < 9; i++) {
            const t = i / 8;
            const cellS = t < 0.5 ? 0.12 + t * 1.76 : 1;
            const cellV = t < 0.5 ? 0.98 : 0.98 - (t - 0.5) * 1.65;
            const cellHex = hsvaToHex(cpState.h, Math.min(1, cellS), Math.max(0.12, cellV), 1);
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "cp-shade-cell" + (cellHex === solidHex ? " active" : "");
            btn.style.backgroundImage = "none";
            btn.style.backgroundColor = cellHex;
            btn.addEventListener("click", () => {
                const next = hexToHsva(cellHex);
                cpState.s = next.s;
                cpState.v = next.v;
                renderColorPickerUI();
            });
            frag.appendChild(btn);
        }
        els.cpShadesRow.replaceChildren(frag);
    }

    function openColorPicker({ title, initialHex, onApply }) {
        const { els, normalizeHex, hexToHsva } = GD;
        els.cpModalTitle.textContent = title || "Select Hex Color";
        const norm = normalizeHex(initialHex || "#38BDF8");
        const parsed = hexToHsva(norm);
        cpState.h = parsed.h;
        cpState.s = parsed.s;
        cpState.v = parsed.v;
        cpState.a = parsed.a;
        cpState.onApply = onApply;
        els.cpHexInput.value = norm;
        renderColorPickerUI();
        els.colorPickerModal.classList.add("open");
    }

    function bindPointerDrag(el, handler) {
        const updateFromEvent = (e) => {
            const rect = el.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const nx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            const ny = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
            handler(nx, ny);
        };

        el.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            el.setPointerCapture(e.pointerId);
            updateFromEvent(e);
            const onMove = (ev) => updateFromEvent(ev);
            const onUp = () => {
                el.removeEventListener("pointermove", onMove);
                el.removeEventListener("pointerup", onUp);
                el.removeEventListener("pointercancel", onUp);
            };
            el.addEventListener("pointermove", onMove);
            el.addEventListener("pointerup", onUp);
            el.addEventListener("pointercancel", onUp);
        });
    }

    function initStylingStudio() {
        const { els, state, hexToHsva, hsvaToHex, scheduleLiveUpdate, showCustomDialog, textStyles, bgFx } = GD;

        bindPointerDrag(els.cpSvBox, (nx, ny) => {
            cpState.s = nx;
            cpState.v = 1 - ny;
            renderColorPickerUI();
        });

        bindPointerDrag(els.cpHueBar, (nx) => {
            cpState.h = Math.round(nx * 360);
            renderColorPickerUI();
        });

        bindPointerDrag(els.cpAlphaBar, (nx) => {
            cpState.a = Math.round(nx * 100) / 100;
            renderColorPickerUI();
        });

        els.cpHexInput.addEventListener("input", () => {
            const raw = els.cpHexInput.value.trim().replace(/^#/, "");
            if (/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(raw)) {
                const parsed = hexToHsva("#" + raw);
                cpState.h = parsed.h;
                cpState.s = parsed.s;
                cpState.v = parsed.v;
                cpState.a = parsed.a;
                renderColorPickerUI();
            }
        });

        const closeColorPickerWithoutApply = () => {
            els.colorPickerModal.classList.remove("open");
        };

        els.cpCancelBtn.addEventListener("click", closeColorPickerWithoutApply);
        els.cpCloseX.addEventListener("click", closeColorPickerWithoutApply);
        els.colorPickerModal.addEventListener("click", (e) => {
            if (e.target === els.colorPickerModal) closeColorPickerWithoutApply();
        });

        els.cpApplyBtn.addEventListener("click", () => {
            const finalHex = hsvaToHex(cpState.h, cpState.s, cpState.v, cpState.a);
            els.colorPickerModal.classList.remove("open");
            if (cpState.onApply) cpState.onApply(finalHex);
        });

        els.studioToggle.addEventListener("change", () => {
            state.studioEnabled = els.studioToggle.checked;
            els.studioToggleText.textContent = state.studioEnabled ? "On" : "Off";
            els.studioBody.classList.toggle("open", state.studioEnabled);
            scheduleLiveUpdate();
        });

        els.resetStudioBtn.addEventListener("click", () => {
            showCustomDialog({
                title: "Reset Styling Studio",
                message: "Reset all Styling Studio customizations back to default?",
                cancelText: "Cancel",
                confirmText: "Reset All",
                onConfirm: () => {
                    if (textStyles && typeof textStyles.resetAllTextStylesToTemplate === "function") {
                        textStyles.resetAllTextStylesToTemplate();
                    }
                    if (bgFx && typeof bgFx.resetBgFxToDefault === "function") {
                        bgFx.resetBgFxToDefault();
                    }
                    scheduleLiveUpdate();
                },
            });
        });
    }

    GD.stylingStudio = {
        openColorPicker,
        initStylingStudio,
    };
})();
