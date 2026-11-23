(function () {
    "use strict";

    const GD = (window.GD = window.GD || {});

    function getTagState(tag) {
        const { state, getSelectedTemplate, getTemplateBaseForTag } = GD;
        const tpl = getSelectedTemplate();
        const base = getTemplateBaseForTag(tpl, tag);
        if (!state.elementStyles[tag]) {
            state.elementStyles[tag] = {
                color: base.color,
                colorChanged: false,
                fontFamily: "",
                fontWeight: "",
                textAlign: "",
                fontSize: base.fontSize,
                fontSizeChanged: false,
                letterSpacing: 0,
                lineHeight: 1.5,
                glowEnabled: false,
                glowColor: "#38BDF8CC",
                glowIntensity: 12,
                shadowEnabled: false,
                shadowColor: "#000000B3",
                shadowIntensity: 4,
                gradientEnabled: false,
                gradColor1: "#38BDF8",
                gradColor2: "#A78BFA",
                imageClipEnabled: false,
                imageClipUrl: "",
            };
        }
        return state.elementStyles[tag];
    }

    function resetAllTextStylesToTemplate() {
        const { state } = GD;
        state.elementStyles = {};
        syncStudioControlsToTarget();
    }

    function buildMergedInternalCss(tpl, presentElements) {
        const { state, parseTemplateRules, computeHeadingComplementColor, getTemplateBaseForTag, validateImageLink } = GD;
        const parsed = parseTemplateRules(tpl.style);

        if (!state.studioEnabled || !state.textStylesEnabled || presentElements.length === 0) {
            return tpl.style;
        }

        const autoHeadingColor = computeHeadingComplementColor(tpl);

        ["h1", "h2", "h3", "p"].forEach((tag) => {
            if (!presentElements.includes(tag)) return;
            const sel = `#b ${tag}`;
            const base = getTemplateBaseForTag(tpl, tag);
            const cfg = getTagState(tag);
            const existingProps = parsed.map.get(sel) ? [...parsed.map.get(sel)] : [];

            const setOrReplaceProp = (key, val) => {
                const idx = existingProps.findIndex((p) => p.key === key);
                if (idx !== -1) {
                    existingProps[idx].val = val;
                } else {
                    existingProps.push({ key, val });
                }
            };

            const removeProp = (key) => {
                const idx = existingProps.findIndex((p) => p.key === key);
                if (idx !== -1) existingProps.splice(idx, 1);
            };

            if ((tag === "h2" || tag === "h3") && !base.hasOriginalColor && !cfg.colorChanged) {
                cfg.color = autoHeadingColor;
                setOrReplaceProp("color", autoHeadingColor);
            } else if (cfg.colorChanged) {
                setOrReplaceProp("color", cfg.color.toLowerCase());
            }

            if (cfg.fontSizeChanged) {
                setOrReplaceProp("font-size", `${cfg.fontSize}px`);
            }

            if (cfg.fontFamily) {
                setOrReplaceProp("font-family", cfg.fontFamily);
            }

            if (cfg.fontWeight) {
                setOrReplaceProp("font-weight", cfg.fontWeight);
            }

            if (cfg.textAlign) {
                setOrReplaceProp("text-align", cfg.textAlign);
            }

            if (Number(cfg.letterSpacing) !== 0) {
                setOrReplaceProp("letter-spacing", `${cfg.letterSpacing}px`);
            } else {
                removeProp("letter-spacing");
            }

            if (Number(cfg.lineHeight) !== 1.5) {
                setOrReplaceProp("line-height", `${cfg.lineHeight}`);
            } else {
                removeProp("line-height");
            }

            const shadows = [];
            if (cfg.glowEnabled) {
                const g = cfg.glowIntensity;
                const gc = cfg.glowColor.toLowerCase();
                shadows.push(`0 0 ${g}px ${gc}`);
                shadows.push(`0 0 ${Math.round(g * 1.8)}px ${gc}`);
            }
            if (cfg.shadowEnabled) {
                const s = cfg.shadowIntensity;
                const sc = cfg.shadowColor.toLowerCase();
                shadows.push(`${Math.max(1, Math.round(s * 0.5))}px ${s}px ${Math.round(s * 1.4)}px ${sc}`);
            }
            if (shadows.length > 0) {
                setOrReplaceProp("text-shadow", shadows.join(", "));
            } else {
                removeProp("text-shadow");
            }

            const clipValidation = cfg.imageClipEnabled ? validateImageLink(cfg.imageClipUrl) : { valid: false };
            const safeClipUrl = clipValidation.valid ? cfg.imageClipUrl.trim().replace(/['"\\]/g, "") : "";

            if (safeClipUrl) {
                removeProp("background");
                setOrReplaceProp("background-image", `url('${safeClipUrl}')`);
                setOrReplaceProp("background-size", "cover");
                setOrReplaceProp("background-position", "center");
                setOrReplaceProp("-webkit-background-clip", "text");
                setOrReplaceProp("-webkit-text-fill-color", "transparent");
            } else if (cfg.gradientEnabled) {
                removeProp("background-image");
                removeProp("background-size");
                removeProp("background-position");
                setOrReplaceProp(
                    "background",
                    `linear-gradient(135deg, ${cfg.gradColor1.toLowerCase()}, ${cfg.gradColor2.toLowerCase()})`
                );
                setOrReplaceProp("-webkit-background-clip", "text");
                setOrReplaceProp("-webkit-text-fill-color", "transparent");
            } else {
                removeProp("background");
                removeProp("background-image");
                removeProp("background-size");
                removeProp("background-position");
                removeProp("-webkit-background-clip");
                removeProp("-webkit-text-fill-color");
            }

            if (existingProps.length > 0) {
                if (!parsed.map.has(sel)) parsed.order.push(sel);
                parsed.map.set(sel, existingProps);
            }
        });

        return parsed.order
            .map((sel) => {
                const props = parsed.map.get(sel);
                if (!props || props.length === 0) return "";
                const decls = props.map((p) => `${p.key}:${p.val};`).join("");
                return `${sel}{${decls}}`;
            })
            .filter(Boolean)
            .join("\n");
    }

    function syncTargetElementDropdown(presentElements) {
        const { state, els, ELEMENT_LABELS } = GD;
        state.presentElements = presentElements;
        if (presentElements.length === 0) {
            els.targetElLabel.textContent = "None present";
            els.targetElBtn.classList.add("disabled");
            return;
        }
        els.targetElBtn.classList.remove("disabled");
        if (!presentElements.includes(state.targetEl)) {
            state.targetEl = presentElements[0];
        }
        els.targetElLabel.textContent = ELEMENT_LABELS[state.targetEl] || state.targetEl;
    }

    function syncStudioControlsToTarget() {
        const {
            state,
            els,
            ELEMENT_LABELS,
            FONT_GROUPS,
            WEIGHT_OPTIONS,
            ALIGN_OPTIONS,
            getSelectedTemplate,
            getTemplateBaseForTag,
            computeHeadingComplementColor,
            paintSwatchChip,
            updateSliderVisual,
            validateImageLink,
        } = GD;

        const tpl = getSelectedTemplate();
        const tag = state.presentElements.includes(state.targetEl)
            ? state.targetEl
            : state.presentElements[0] || "h1";
        const cfg = getTagState(tag);
        const base = getTemplateBaseForTag(tpl, tag);

        if ((tag === "h2" || tag === "h3") && !base.hasOriginalColor && !cfg.colorChanged) {
            cfg.color = computeHeadingComplementColor(tpl);
        }

        if (state.presentElements.length === 0) {
            els.targetElLabel.textContent = "None present";
        } else {
            els.targetElLabel.textContent = ELEMENT_LABELS[tag] || tag;
        }

        paintSwatchChip(els.textColorChip, cfg.color);
        els.textColorHex.textContent = cfg.color;

        let ffLabel = "Default (Template)";
        FONT_GROUPS.forEach((g) => {
            const hit = g.items.find((it) => it.value === cfg.fontFamily);
            if (hit) ffLabel = hit.label;
        });
        els.fontFamilyLabel.textContent = ffLabel;

        const wHit = WEIGHT_OPTIONS.find((w) => w.value === cfg.fontWeight);
        els.fontWeightLabel.textContent = wHit ? wHit.label : "Default";

        const aHit = ALIGN_OPTIONS.find((a) => a.value === cfg.textAlign);
        els.textAlignLabel.textContent = aHit ? aHit.label : "Default";

        els.fontSizeSlider.value = cfg.fontSize;
        els.fontSizeVal.textContent = `${cfg.fontSize}px`;
        updateSliderVisual(els.fontSizeSlider);

        els.letterSpacingSlider.value = cfg.letterSpacing;
        if (Number(cfg.letterSpacing) === 0) {
            els.letterSpacingVal.textContent = "Off (0px)";
            els.letterSpacingVal.classList.add("is-off");
        } else {
            els.letterSpacingVal.textContent = `${cfg.letterSpacing}px`;
            els.letterSpacingVal.classList.remove("is-off");
        }
        updateSliderVisual(els.letterSpacingSlider);

        els.lineHeightSlider.value = cfg.lineHeight;
        if (Number(cfg.lineHeight) === 1.5) {
            els.lineHeightVal.textContent = "Off (1.5)";
            els.lineHeightVal.classList.add("is-off");
        } else {
            els.lineHeightVal.textContent = `${cfg.lineHeight}`;
            els.lineHeightVal.classList.remove("is-off");
        }
        updateSliderVisual(els.lineHeightSlider);

        els.glowToggle.checked = cfg.glowEnabled;
        els.glowToggleText.textContent = cfg.glowEnabled ? "On" : "Off";
        els.glowBody.classList.toggle("open", cfg.glowEnabled);
        paintSwatchChip(els.glowColorChip, cfg.glowColor);
        els.glowColorHex.textContent = cfg.glowColor;
        els.glowIntensitySlider.value = cfg.glowIntensity;
        els.glowIntensityVal.textContent = `${cfg.glowIntensity}px`;
        updateSliderVisual(els.glowIntensitySlider);

        els.shadowToggle.checked = cfg.shadowEnabled;
        els.shadowToggleText.textContent = cfg.shadowEnabled ? "On" : "Off";
        els.shadowBody.classList.toggle("open", cfg.shadowEnabled);
        paintSwatchChip(els.shadowColorChip, cfg.shadowColor);
        els.shadowColorHex.textContent = cfg.shadowColor;
        els.shadowIntensitySlider.value = cfg.shadowIntensity;
        els.shadowIntensityVal.textContent = `${cfg.shadowIntensity}px`;
        updateSliderVisual(els.shadowIntensitySlider);

        els.gradientToggle.checked = cfg.gradientEnabled;
        els.gradientToggleText.textContent = cfg.gradientEnabled ? "On" : "Off";
        els.gradientBody.classList.toggle("open", cfg.gradientEnabled);
        paintSwatchChip(els.gradColor1Chip, cfg.gradColor1);
        els.gradColor1Hex.textContent = cfg.gradColor1;
        paintSwatchChip(els.gradColor2Chip, cfg.gradColor2);
        els.gradColor2Hex.textContent = cfg.gradColor2;

        els.imageClipToggle.checked = cfg.imageClipEnabled;
        els.imageClipToggleText.textContent = cfg.imageClipEnabled ? "On" : "Off";
        els.imageClipBody.classList.toggle("open", cfg.imageClipEnabled);
        if (document.activeElement !== els.imageClipUrlInput) {
            els.imageClipUrlInput.value = cfg.imageClipUrl;
        }

        const clipRes = validateImageLink(cfg.imageClipUrl);
        const showError = cfg.imageClipEnabled && cfg.imageClipUrl.trim().length > 0 && !clipRes.valid;
        els.imageClipUrlInput.classList.toggle("invalid", showError);
        els.imageClipStatus.textContent = clipRes.message;
        els.imageClipStatus.classList.toggle("error", showError);
        els.imageClipStatus.classList.toggle("valid", cfg.imageClipEnabled && clipRes.valid);
    }

    function initTextStyles() {
        const {
            els,
            state,
            ELEMENT_LABELS,
            FONT_GROUPS,
            WEIGHT_OPTIONS,
            ALIGN_OPTIONS,
            scheduleLiveUpdate,
            openCustomDropdown,
            showCustomDialog,
            stylingStudio,
        } = GD;

        els.textStylesToggle.addEventListener("change", () => {
            state.textStylesEnabled = els.textStylesToggle.checked;
            els.textStylesToggleText.textContent = state.textStylesEnabled ? "On" : "Off";
            els.textStylesBody.classList.toggle("open", state.textStylesEnabled);
            scheduleLiveUpdate();
        });

        els.resetTextStylesBtn.addEventListener("click", () => {
            showCustomDialog({
                title: "Reset Text Styles",
                message: "Reset all Text Styles (colors, fonts, sizes, glow, shadow, gradients, and image clip) to default?",
                cancelText: "Cancel",
                confirmText: "Reset Text",
                onConfirm: () => {
                    resetAllTextStylesToTemplate();
                    scheduleLiveUpdate();
                },
            });
        });

        els.targetElBtn.addEventListener("click", () => {
            if (state.presentElements.length === 0) {
                showCustomDialog({
                    title: "No Text Elements",
                    message: "Your greeting text currently has no h1, h2, h3, or p elements to style.",
                    confirmText: "Got it",
                });
                return;
            }
            openCustomDropdown({
                title: "Select Text Element",
                groups: [
                    {
                        divider: "Present in Your Story",
                        items: state.presentElements.map((tag) => ({
                            label: ELEMENT_LABELS[tag] || tag,
                            value: tag,
                        })),
                    },
                ],
                currentValue: state.targetEl,
                onSelect: (val) => {
                    state.targetEl = val;
                    syncStudioControlsToTarget();
                },
            });
        });

        els.textColorBtn.addEventListener("click", () => {
            const cfg = getTagState(state.targetEl);
            stylingStudio.openColorPicker({
                title: `Text Color (${state.targetEl})`,
                initialHex: cfg.color,
                onApply: (hex) => {
                    cfg.color = hex;
                    cfg.colorChanged = true;
                    scheduleLiveUpdate();
                },
            });
        });

        els.fontFamilyBtn.addEventListener("click", () => {
            const cfg = getTagState(state.targetEl);
            openCustomDropdown({
                title: "Select Font Family",
                groups: FONT_GROUPS,
                currentValue: cfg.fontFamily,
                onSelect: (val) => {
                    cfg.fontFamily = val;
                    scheduleLiveUpdate();
                },
            });
        });

        els.fontWeightBtn.addEventListener("click", () => {
            const cfg = getTagState(state.targetEl);
            openCustomDropdown({
                title: "Select Font Weight",
                groups: [{ divider: "Font Weight", items: WEIGHT_OPTIONS }],
                currentValue: cfg.fontWeight,
                onSelect: (val) => {
                    cfg.fontWeight = val;
                    scheduleLiveUpdate();
                },
            });
        });

        els.textAlignBtn.addEventListener("click", () => {
            const cfg = getTagState(state.targetEl);
            openCustomDropdown({
                title: "Select Text Alignment",
                groups: [{ divider: "Alignment", items: ALIGN_OPTIONS }],
                currentValue: cfg.textAlign,
                onSelect: (val) => {
                    cfg.textAlign = val;
                    scheduleLiveUpdate();
                },
            });
        });

        els.fontSizeSlider.addEventListener("input", () => {
            const cfg = getTagState(state.targetEl);
            cfg.fontSize = Number(els.fontSizeSlider.value);
            cfg.fontSizeChanged = true;
            scheduleLiveUpdate();
        });

        els.letterSpacingSlider.addEventListener("input", () => {
            const cfg = getTagState(state.targetEl);
            cfg.letterSpacing = Number(els.letterSpacingSlider.value);
            scheduleLiveUpdate();
        });

        els.lineHeightSlider.addEventListener("input", () => {
            const cfg = getTagState(state.targetEl);
            cfg.lineHeight = Number(els.lineHeightSlider.value);
            scheduleLiveUpdate();
        });

        els.glowToggle.addEventListener("change", () => {
            const cfg = getTagState(state.targetEl);
            cfg.glowEnabled = els.glowToggle.checked;
            scheduleLiveUpdate();
        });

        els.glowColorBtn.addEventListener("click", () => {
            const cfg = getTagState(state.targetEl);
            stylingStudio.openColorPicker({
                title: `Glow Color (${state.targetEl})`,
                initialHex: cfg.glowColor,
                onApply: (hex) => {
                    cfg.glowColor = hex;
                    scheduleLiveUpdate();
                },
            });
        });

        els.glowIntensitySlider.addEventListener("input", () => {
            const cfg = getTagState(state.targetEl);
            cfg.glowIntensity = Number(els.glowIntensitySlider.value);
            scheduleLiveUpdate();
        });

        els.shadowToggle.addEventListener("change", () => {
            const cfg = getTagState(state.targetEl);
            cfg.shadowEnabled = els.shadowToggle.checked;
            scheduleLiveUpdate();
        });

        els.shadowColorBtn.addEventListener("click", () => {
            const cfg = getTagState(state.targetEl);
            stylingStudio.openColorPicker({
                title: `Shadow Color (${state.targetEl})`,
                initialHex: cfg.shadowColor,
                onApply: (hex) => {
                    cfg.shadowColor = hex;
                    scheduleLiveUpdate();
                },
            });
        });

        els.shadowIntensitySlider.addEventListener("input", () => {
            const cfg = getTagState(state.targetEl);
            cfg.shadowIntensity = Number(els.shadowIntensitySlider.value);
            scheduleLiveUpdate();
        });

        els.gradientToggle.addEventListener("change", () => {
            const cfg = getTagState(state.targetEl);
            cfg.gradientEnabled = els.gradientToggle.checked;
            scheduleLiveUpdate();
        });

        els.gradColor1Btn.addEventListener("click", () => {
            const cfg = getTagState(state.targetEl);
            stylingStudio.openColorPicker({
                title: `Gradient Start (${state.targetEl})`,
                initialHex: cfg.gradColor1,
                onApply: (hex) => {
                    cfg.gradColor1 = hex;
                    scheduleLiveUpdate();
                },
            });
        });

        els.gradColor2Btn.addEventListener("click", () => {
            const cfg = getTagState(state.targetEl);
            stylingStudio.openColorPicker({
                title: `Gradient End (${state.targetEl})`,
                initialHex: cfg.gradColor2,
                onApply: (hex) => {
                    cfg.gradColor2 = hex;
                    scheduleLiveUpdate();
                },
            });
        });

        els.imageClipToggle.addEventListener("change", () => {
            const cfg = getTagState(state.targetEl);
            cfg.imageClipEnabled = els.imageClipToggle.checked;
            scheduleLiveUpdate();
        });

        els.imageClipUrlInput.addEventListener("input", () => {
            const cfg = getTagState(state.targetEl);
            cfg.imageClipUrl = els.imageClipUrlInput.value;
            scheduleLiveUpdate();
        });
    }

    GD.textStyles = {
        getTagState,
        resetAllTextStylesToTemplate,
        buildMergedInternalCss,
        syncTargetElementDropdown,
        syncStudioControlsToTarget,
        initTextStyles,
    };
})();
