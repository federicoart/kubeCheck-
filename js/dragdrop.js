// dragdrop.js
// Gestione drag & drop semplice e ordinata per le card overview
// Da includere dopo overview.js

// Attiva il drag & drop sulle card overview
window.enableOverviewDragDrop = function(containerSelector = '#overviewRow', cardSelector = '.overview-card') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  // Applica flexbox per ordinamento automatico e responsive
  container.style.display = 'flex';
  container.style.flexWrap = 'wrap';
  container.style.alignItems = 'stretch';
  container.style.justifyContent = 'flex-start';
  container.style.gap = '16px';

  let dragged = null;

  // Inizio drag: salva la card trascinata
  container.addEventListener('dragstart', function (e) {
    const card = e.target.closest(cardSelector);
    if (!card) return;
    dragged = card;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  // Fine drag: rimuovi la classe dragging
  container.addEventListener('dragend', function (e) {
    if (dragged) dragged.classList.remove('dragging');
    dragged = null;
  });

  // Durante il drag, determina la posizione di drop e inserisci la card
  container.addEventListener('dragover', function (e) {
    e.preventDefault();
    const after = getDragAfterElement(container, e.clientX, cardSelector);
    if (after == null) {
      container.appendChild(dragged);
    } else {
      container.insertBefore(dragged, after);
    }
  });

  // Rendi tutte le card draggable
  function updateDraggable() {
    container.querySelectorAll(cardSelector).forEach(card => {
      card.setAttribute('draggable', 'true');
      // Stile responsive e ordinato, personalizzabile via CSS
      card.classList.add('overview-draggable-card');
      // Handle visibile per il resize (in basso a destra)
      if (!card.querySelector('.resize-handle')) {
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        card.appendChild(handle);
      }
    });
  }
  updateDraggable();

  // Gestione resize manuale con mouse sull'handle
  let resizingCard = null;
  let startX, startY, startWidth, startHeight;
  container.addEventListener('mousedown', function(e) {
    const handle = e.target.closest('.resize-handle');
    if (handle) {
      resizingCard = handle.parentElement;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = resizingCard.offsetWidth;
      startHeight = resizingCard.offsetHeight;
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', resizeMove);
      document.addEventListener('mouseup', resizeEnd);
    }
  });
  function resizeMove(e) {
    if (!resizingCard) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    resizingCard.style.width = Math.max(200, startWidth + dx) + 'px';
    resizingCard.style.height = Math.max(120, startHeight + dy) + 'px';
  }
  function resizeEnd() {
    resizingCard = null;
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', resizeMove);
    document.removeEventListener('mouseup', resizeEnd);
  }

  // Trova la card dopo la quale inserire quella trascinata (ordinamento orizzontale)
  function getDragAfterElement(container, x, cardSelector) {
    const cards = [...container.querySelectorAll(cardSelector)].filter(c => !c.classList.contains('dragging'));
    return cards.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: -Infinity }).element;
  }
}


