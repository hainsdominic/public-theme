(function() {
  const state = {
    flavor: [],
    machine: [],
    allProductsHTML: null,
    originalGridHTML: null,
    fetching: false
  };

  function init() {
    const grid = document.getElementById('main-collection-product-grid');
    if (!grid) return;

    state.originalGridHTML = grid.innerHTML;

    restoreStateFromURL();
    bindFilterButtons();

    const hasFilters = state.flavor.length > 0 || state.machine.length > 0;
    if (hasFilters) {
      fetchAndFilter();
    }

    window.addEventListener('popstate', onPopState);
  }

  function restoreStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const flavorParam = params.get('flavor');
    const machineParam = params.get('machine');

    state.flavor = flavorParam ? flavorParam.split(',').filter(Boolean) : [];
    state.machine = machineParam ? machineParam.split(',').filter(Boolean) : [];

    syncButtonStates();
  }

  function syncButtonStates() {
    document.querySelectorAll('.js-collection-filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
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
    document.querySelectorAll('.js-collection-filter-btn').forEach(btn => {
      btn.addEventListener('click', handleFilterClick);
    });
  }

  function getCurrentCollection() {
    const grid = document.getElementById('main-collection-product-grid');
    if (grid && grid.dataset.collectionHandle) return grid.dataset.collectionHandle;
    const match = window.location.pathname.match(/\/collections\/([^\/\?]+)/);
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

    const hasFilters = state.flavor.length > 0 || state.machine.length > 0;
    if (!hasFilters) {
      restoreOriginalGrid();
    } else {
      fetchAndFilter();
    }
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

    const searchParamsString = params.toString();
    window.history.pushState({ flavor: [...state.flavor], machine: [...state.machine], searchParams: searchParamsString }, '', newURL);
    if (typeof FacetFiltersForm !== 'undefined') {
      FacetFiltersForm.searchParamsPrev = searchParamsString;
    }
  }

  function fetchAndFilter() {
    if (state.allProductsHTML) {
      injectAllProductsAndFilter();
      return;
    }

    if (state.fetching) return;
    state.fetching = true;

    const grid = document.getElementById('main-collection-product-grid');
    grid.classList.add('collection-loading');

    const collectionPath = window.location.pathname;

    fetch(`${collectionPath}?section_id=helper-collection-products`)
      .then(response => response.text())
      .then(html => {
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        const helper = parsed.getElementById('helper-all-products');
        state.allProductsHTML = helper ? helper.innerHTML : '';
        state.fetching = false;
        injectAllProductsAndFilter();
      })
      .catch(() => {
        state.fetching = false;
        grid.classList.remove('collection-loading');
      });
  }

  function injectAllProductsAndFilter() {
    const grid = document.getElementById('main-collection-product-grid');
    grid.innerHTML = state.allProductsHTML;

    grid.querySelectorAll('template').forEach(elm => {
      elm.closest('form')?.append(elm.content.cloneNode(true));
    });

    grid.classList.remove('collection-loading');

    const pagination = document.getElementById('collection-pagination');
    if (pagination) pagination.style.display = 'none';

    applyFilters();
    reinitComponents();
  }

  function restoreOriginalGrid() {
    const grid = document.getElementById('main-collection-product-grid');
    grid.innerHTML = state.originalGridHTML;

    grid.querySelectorAll('template').forEach(elm => {
      elm.closest('form')?.append(elm.content.cloneNode(true));
    });

    const pagination = document.getElementById('collection-pagination');
    if (pagination) pagination.style.display = '';

    reinitComponents();
  }

  function applyFilters() {
    const products = document.querySelectorAll('[data-js-product-item]');
    const hasFlavorFilters = state.flavor.length > 0;
    const hasMachineFilters = state.machine.length > 0;

    if (!hasFlavorFilters && !hasMachineFilters) {
      products.forEach(product => product.classList.remove('filter-hidden'));
      return;
    }

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

      if (matchesFlavor && matchesMachine) {
        product.classList.remove('filter-hidden');
      } else {
        product.classList.add('filter-hidden');
      }
    });
  }

  function reinitComponents() {
    document.querySelectorAll('.mount-quick-buy').forEach(el => {
      if (typeof window.theme?.mountQuickBuy === 'function') {
        window.theme.mountQuickBuy(el);
      }
    });

    document.querySelectorAll('.mount-css-slider').forEach(el => {
      if (typeof window.theme?.mountCSSSlider === 'function') {
        window.theme.mountCSSSlider(el);
      }
    });
  }

  function onPopState(e) {
    if (e.state && (e.state.flavor || e.state.machine)) {
      state.flavor = e.state.flavor || [];
      state.machine = e.state.machine || [];

      if (typeof FacetFiltersForm !== 'undefined' && e.state.searchParams !== undefined) {
        FacetFiltersForm.searchParamsPrev = e.state.searchParams;
      }

      syncButtonStates();

      const hasFilters = state.flavor.length > 0 || state.machine.length > 0;
      if (!hasFilters) {
        restoreOriginalGrid();
      } else {
        fetchAndFilter();
      }
    } else {
      state.flavor = [];
      state.machine = [];
      syncButtonStates();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
