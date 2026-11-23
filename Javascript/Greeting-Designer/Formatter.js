(function () {
    "use strict";

    const GD = (window.GD = window.GD || {});

    function escapeHtml(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function parseInline(text) {
        let out = escapeHtml(text);
        out = out.replace(/\*\*\*([\s\S]+?)\*\*\*/g, "<b><i>$1</i></b>");
        out = out.replace(/\*\*([\s\S]+?)\*\*/g, "<b>$1</b>");
        out = out.replace(/\*([^\*\n]+?)\*/g, "<i>$1</i>");
        return out;
    }

    function formatStoryAndDetectElements(rawText) {
        const lines = rawText.split(/\r?\n/);
        const htmlParts = [];
        const found = new Set();

        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (!trimmed) continue;

            if (/^###\s+(.+)$/.test(trimmed)) {
                found.add("h3");
                htmlParts.push("<h3>" + parseInline(trimmed.replace(/^###\s+/, "")) + "</h3>");
            } else if (/^##\s+(.+)$/.test(trimmed)) {
                found.add("h2");
                htmlParts.push("<h2>" + parseInline(trimmed.replace(/^##\s+/, "")) + "</h2>");
            } else if (/^#\s+(.+)$/.test(trimmed)) {
                found.add("h1");
                htmlParts.push("<h1>" + parseInline(trimmed.replace(/^#\s+/, "")) + "</h1>");
            } else {
                found.add("p");
                htmlParts.push("<p>" + parseInline(trimmed) + "</p>");
            }
        }

        const ordered = ["h1", "h2", "h3", "p"].filter((t) => found.has(t));
        return { html: htmlParts.join(""), presentElements: ordered };
    }

    GD.formatter = {
        escapeHtml,
        parseInline,
        formatStoryAndDetectElements,
    };
})();
