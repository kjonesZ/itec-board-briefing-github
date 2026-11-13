document.querySelectorAll("[data-tabs]").forEach((group) => {
  const tabList = group.querySelector("[data-tab-list]");
  const tabs = Array.from(tabList.querySelectorAll("button"));
  const panels = tabs.map((tab) => document.getElementById(tab.dataset.panel));

  function selectTab(index) {
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
    });
  }

  tabList.setAttribute("role", "tablist");
  tabs.forEach((tab, index) => {
    const panel = panels[index];
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panel.id);
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    panel.tabIndex = 0;
    tab.addEventListener("click", () => selectTab(index));
  });

  function selectFromLocation() {
    const target = document.getElementById(window.location.hash.slice(1));
    const position = panels.findIndex((panel) => panel.contains(target));
    if (position < 0) return;
    const wasHidden = panels[position].hidden;
    selectTab(position);
    if (wasHidden) target.scrollIntoView();
  }

  selectTab(0);
  selectFromLocation();
  window.addEventListener("hashchange", selectFromLocation);
  tabList.hidden = false;

  tabList.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(event.target);
    if (index === -1) return;
    const destinations = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const nextIndex = destinations[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectTab(nextIndex);
    tabs[nextIndex].focus();
  });
});

const planDialog = document.querySelector("[data-plan-dialog]");
const planDialogTitle = planDialog.querySelector("h2");
const planDialogImage = planDialog.querySelector(".plan-dialog-image");

document.querySelectorAll("[data-enlarge-plan]").forEach((button) => {
  button.hidden = false;
  button.addEventListener("click", () => {
    const plan = button.closest(".plan-view");
    const image = plan.querySelector(".plan-map img").cloneNode();
    image.loading = "eager";
    planDialogTitle.textContent = plan.dataset.planTitle;
    planDialogImage.replaceChildren(image);
    planDialog.showModal();
    planDialogImage.scrollTo(0, 0);
  });
});

document.querySelectorAll(".plan-pin").forEach((pin) => {
  pin.hidden = false;
  pin.addEventListener("click", () => {
    const room = document.getElementById(pin.hash.slice(1));
    room.tabIndex = -1;
    room.focus({ preventScroll: true });
  });
});

document.querySelectorAll("[data-print]").forEach((button) => {
  button.addEventListener("click", () => window.print());
  button.hidden = false;
});

const notes = document.getElementById("speaker-notes");
document.querySelector('a[href="#speaker-notes"]').addEventListener("click", () => {
  notes.open = true;
});

const copyButton = document.querySelector("[data-copy]");
const copyStatus = document.querySelector("[data-copy-status]");
const paragraphs = document.querySelectorAll("#opening p");

function copyInBrowser(text) {
  const field = document.createElement("textarea");
  field.value = text;
  field.readOnly = true;
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  try {
    return document.execCommand("copy");
  } finally {
    field.remove();
    copyButton.focus();
  }
}

copyButton.addEventListener("click", async () => {
  const text = Array.from(paragraphs, (paragraph) => paragraph.textContent.trim()).join("\n\n");
  copyStatus.textContent = "";
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    let copied = false;
    try {
      copied = copyInBrowser(text);
    } catch {
      // Some browsers block clipboard access for local files.
    }
    if (!copied) {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("opening"));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      copyStatus.textContent = "Opening selected. Use your browser’s Copy command.";
      return;
    }
  }
  copyStatus.textContent = "Opening copied.";
});
copyButton.hidden = false;

const receiptToggle = document.querySelector("[data-receipt-toggle]");
const receiptButtons = Array.from(receiptToggle.querySelectorAll("button"));
const receiptEvidence = document.querySelector("[data-receipt-evidence]");
const receiptPanels = Array.from(receiptEvidence.querySelectorAll("[data-receipt-panel]"));

function showReceipt(mode) {
  receiptButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.receiptMode === mode));
  });
  receiptPanels.forEach((panel) => {
    panel.hidden = panel.dataset.receiptPanel !== mode;
  });
}

receiptButtons.forEach((button) => {
  button.addEventListener("click", () => showReceipt(button.dataset.receiptMode));
});
showReceipt("matched");
receiptEvidence.dataset.enhanced = "";
receiptToggle.hidden = false;
