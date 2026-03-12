(function() {
  const state = {
    flavor: [],
    machine: []
  };

  function init() {
    restoreStateFromURL();
    bindFilterButtons();
    applyFilters();

    document.documentElement.classList.remove('has-custom-filters');

    const hasFilters = state.flavor.length > 0 || state.machine.length > 0;
    const pagination = document.querySelector('.pagination');
    if (pagination && hasFilters) {
      pagination.style.display = 'none';
    }
  }

  function restoreStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const flavorParam = params.get('flavor');
    const machineParam = params.get('machine');

    if (flavorParam) {
      state.flavor = flavorParam.split(',').filter(Boolean);
    }
    if (machineParam) {
      state.machine = machineParam.split(',').filter(Boolean);
    }

    state.flavor.forEach(handle => {
      const btn = document.querySelector(`.js-collection-filter-btn[data-filter-handle="${handle}"][data-filter-type="flavor"]`);
      if (btn) btn.classList.add('active');
    });
    state.machine.forEach(handle => {
      const btn = document.querySelector(`.js-collection-filter-btn[data-filter-handle="${handle}"][data-filter-type="machine"]`);
      if (btn) btn.classList.add('active');
    });
  }

  function bindFilterButtons() {
    const buttons = document.querySelectorAll('.js-collection-filter-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', handleFilterClick);
    });
  }

  function getCurrentCollection() {
    const path = window.location.pathname;
    const match = path.match(/\/collections\/([^\/\?]+)/);
    return match ? match[1] : null;
  }

  function handleFilterClick(e) {
    const btn = e.currentTarget;
    const handle = btn.dataset.filterHandle;
    const type = btn.dataset.filterType;

    if (!state[type]) return;

    const isCapsule = handle === 'capsules-1';
    const currentCollection = getCurrentCollection();
    const onCapsulesPage = currentCollection === 'capsules-1' || currentCollection === 'capsules';

    if (isCapsule) {
      window.location.href = 'https://cafepublic.ca/collections/capsules-1';
      return;
    }

    if (onCapsulesPage && type === 'machine') {
      window.location.href = `https://cafepublic.ca/collections/all?machine=${handle}`;
      return;
    }

    const index = state[type].indexOf(handle);
    if (index === -1) {
      state[type].push(handle);
      btn.classList.add('active');
    } else {
      state[type].splice(index, 1);
      btn.classList.remove('active');
    }

    syncStateToURL();
    applyFilters();
  }

  function syncStateToURL() {
    const params = new URLSearchParams(window.location.search);

    if (state.flavor.length > 0) {
      params.set('flavor', state.flavor.join(','));
    } else {
      params.delete('flavor');
    }

    if (state.machine.length > 0) {
      params.set('machine', state.machine.join(','));
    } else {
      params.delete('machine');
    }

    const newURL = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.replaceState({}, '', newURL);
  }

  function applyFilters() {
    const products = document.querySelectorAll('[data-js-product-item]');
    const hasFlavorFilters = state.flavor.length > 0;
    const hasMachineFilters = state.machine.length > 0;
    const hasAnyFilters = hasFlavorFilters || hasMachineFilters;

    if (!hasAnyFilters) {
      products.forEach(product => product.classList.remove('filter-hidden'));
      return;
    }

    let visibleCount = 0;

    products.forEach(product => {
      const collectionsAttr = product.dataset.collections || '';
      const productCollections = collectionsAttr.split(',').filter(Boolean);

      let matchesFlavor = true;
      let matchesMachine = true;

      if (hasFlavorFilters) {
        matchesFlavor = state.flavor.every(handle => productCollections.includes(handle));
      }

      if (hasMachineFilters) {
        matchesMachine = state.machine.some(handle => productCollections.includes(handle));
      }

      const shouldShow = matchesFlavor && matchesMachine;

      if (shouldShow) {
        product.classList.remove('filter-hidden');
        visibleCount++;
      } else {
        product.classList.add('filter-hidden');
      }
    });

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
