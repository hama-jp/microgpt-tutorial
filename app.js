// Build the page from SECTIONS data
(function () {
  const toc = document.getElementById("toc");
  const content = document.getElementById("content");

  SECTIONS.forEach((sec, idx) => {
    const num = idx + 1;

    // --- Table of Contents link ---
    const tocLink = document.createElement("a");
    tocLink.href = `#${sec.id}`;
    tocLink.textContent = `${num}. ${sec.title}`;
    toc.appendChild(tocLink);

    // --- Section container ---
    const section = document.createElement("section");
    section.className = "section";
    section.id = sec.id;

    // Header
    section.innerHTML += `
      <div class="section-header">
        <span class="section-number">${num}</span>
        <h2 class="section-title">${sec.title}</h2>
      </div>`;

    // Explanation
    const explanationHTML = sec.explanation
      .map((p) => `<p>${p}</p>`)
      .join("");

    // Create split layout wrapper
    section.innerHTML += `<div class="section-layout"></div>`;
    const layout = section.querySelector(".section-layout");

    // Left pane: code
    layout.innerHTML += `
      <div class="left-pane">
        <div class="code-block">
          <div class="code-block-header">
            <span>microgpt_pytorch.py (${sec.lineRange})</span>
            <span>Python</span>
          </div>
          <pre>${highlightPython(sec.code)}</pre>
        </div>
      </div>`;

    // Right pane: explanation and supplemental information
    let rightPaneHTML = `
      <div class="right-pane">
        <div class="explanation">${explanationHTML}</div>`;

    if (sec.diagram) {
      rightPaneHTML += `
        <div class="diagram">
          ${sec.diagram}
          ${sec.diagramLabel ? `<div class="diagram-label">${sec.diagramLabel}</div>` : ""}
        </div>`;
    }

    if (sec.keyPoint) {
      rightPaneHTML += `
        <div class="key-point">
          <div class="key-point-label">Point</div>
          <p>${sec.keyPoint}</p>
        </div>`;
    }

    rightPaneHTML += "</div>";
    layout.innerHTML += rightPaneHTML;

    // Section navigation
    const prevSec = idx > 0 ? SECTIONS[idx - 1] : null;
    const nextSec = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null;

    section.innerHTML += `
      <div class="section-nav">
        ${prevSec ? `<a class="nav-btn" href="#${prevSec.id}">← 前の項</a>` : '<span class="nav-spacer"></span>'}
        <a class="nav-btn" href="#toc">目次に戻る</a>
        ${nextSec ? `<a class="nav-btn" href="#${nextSec.id}">次の項 →</a>` : '<span class="nav-spacer"></span>'}
      </div>`;

    content.appendChild(section);
  });

  // Simple Python syntax highlighter
  function highlightPython(code) {
    // Escape HTML first
    let s = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Comments
    s = s.replace(/(#.*)/g, '<span class="cm">$1</span>');

    // Strings (single and double quotes)
    s = s.replace(
      /(?<!\\)(&#39;(?:[^&#39;\\]|\\.)*?&#39;|&quot;(?:[^&quot;\\]|\\.)*?&quot;)/g,
      function (m) {
        // Don't highlight if inside a comment
        return '<span class="str">' + m + "</span>";
      }
    );
    // f-strings
    s = s.replace(/\bf(&quot;.*?&quot;|&#39;.*?&#39;)/g, '<span class="str">f$1</span>');

    // Keywords
    const keywords = [
      "class",
      "def",
      "return",
      "import",
      "from",
      "for",
      "in",
      "if",
      "not",
      "super",
      "self",
      "with",
      "as",
      "break",
      "True",
      "False",
      "None",
    ];
    keywords.forEach((kw) => {
      const re = new RegExp(`\\b(${kw})\\b`, "g");
      s = s.replace(re, '<span class="kw">$1</span>');
    });

    // Numbers
    s = s.replace(/\b(\d+\.?\d*(?:e[+-]?\d+)?)\b/g, '<span class="num">$1</span>');

    // Builtins / known functions
    const builtins = [
      "print",
      "len",
      "set",
      "sorted",
      "range",
      "min",
      "sum",
      "open",
      "float",
    ];
    builtins.forEach((fn) => {
      const re = new RegExp(`\\b(${fn})\\b(?=\\()`, "g");
      s = s.replace(re, '<span class="bi">$1</span>');
    });

    // Torch / nn calls
    s = s.replace(/\b(nn\.\w+|torch\.\w+|F\.\w+)/g, '<span class="fn">$1</span>');

    return s;
  }
})();
