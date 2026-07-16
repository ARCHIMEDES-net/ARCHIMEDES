const SKIP_TAGS = new Set([
  "CODE",
  "INPUT",
  "OPTION",
  "PRE",
  "SCRIPT",
  "SELECT",
  "STYLE",
  "TEXTAREA",
]);

// Czech one-letter words must stay with the word that follows them.
// This also covers text added after hydration, such as live programme data.
const SINGLE_LETTER_WORD = /(^|[\s([{„\"'])\b([AaIiKkOoSsUuVvZz])\s+(?=\S)/g;

export function applyCzechNonBreakingSpaces(root) {
  if (!root || typeof document === "undefined") return;

  const processTextNode = (node) => {
    const parent = node.parentElement;
    if (!parent || SKIP_TAGS.has(parent.tagName) || parent.isContentEditable) return;

    const nextValue = node.nodeValue.replace(SINGLE_LETTER_WORD, "$1$2\u00a0");
    if (nextValue !== node.nodeValue) node.nodeValue = nextValue;
  };

  const processNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE || SKIP_TAGS.has(node.tagName)) return;

    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode();
    while (textNode) {
      processTextNode(textNode);
      textNode = walker.nextNode();
    }
  };

  processNode(root);

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(processNode);
      if (mutation.type === "characterData") processTextNode(mutation.target);
    });
  });

  observer.observe(root, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  return () => observer.disconnect();
}
