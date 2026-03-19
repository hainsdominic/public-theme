(function() {
  const state = {
    flavor: [],
    machine: [],
    originalGridHTML: null,
    originalPaginationHTML: null,
    injected: false,
    products: null,
    filterPage: 1,
    perPage: 24
  };

  function init() {
    const grid = document.getElementById('main-collection-product-grid');
    if (!grid) return;

    state.perPage = parseInt(grid.dataset.productsPerPage, 10) || 24;
    state.originalGridHTML = grid.innerHTML;

    const pagination = document.getElementById('collection-pagination');
    if (pagination) state.originalPaginationHTML = pagination.innerHTML;

    restoreStateFromURL();
    bindFilterButtons();

    if (hasActiveFilters()) {
      applyFilters();
    }

    window.addEventListener('popstate', onPopState);
  }

  function hasActiveFilters() {
    return state.flavor.length > 0 || state.machine.length > 0;
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

    state.filterPage = 1;
    syncStateToURL();

    if (!hasActiveFilters()) {
      restoreOriginalGrid();
    } else {
      applyFilters();
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

  function applyFilters() {
    if (!state.injected) {
      const template = document.getElementById('all-products-template');
      if (!template) return;

      const grid = document.getElementById('main-collection-product-grid');
      const clone = template.content.cloneNode(true);
      grid.innerHTML = '';
      grid.appendChild(clone);

      grid.querySelectorAll('template').forEach(elm => {
        elm.closest('form')?.append(elm.content.cloneNode(true));
      });

      state.products = Array.from(grid.querySelectorAll('[data-js-product-item]')).map(el => ({
        el,
        collections: new Set((el.dataset.collections || '').split(',').filter(Boolean))
      }));

      state.injected = true;
      reinitComponents();
    }

    filterAndPaginate();
  }

  function filterAndPaginate() {
    const products = state.products;
    if (!products) return;

    const hasFlavorFilters = state.flavor.length > 0;
    const hasMachineFilters = state.machine.length > 0;
    const start = (state.filterPage - 1) * state.perPage;
    const end = start + state.perPage;
    let visibleIndex = 0;
    let totalVisible = 0;

    for (let i = 0; i < products.length; i++) {
      const { el, collections } = products[i];
      let visible = true;

      if (hasFlavorFilters) {
        for (let j = 0; j < state.flavor.length; j++) {
          if (!collections.has(state.flavor[j])) { visible = false; break; }
        }
      }

      if (visible && hasMachineFilters) {
        visible = false;
        for (let j = 0; j < state.machine.length; j++) {
          if (collections.has(state.machine[j])) { visible = true; break; }
        }
      }

      if (visible) {
        const onPage = visibleIndex >= start && visibleIndex < end;
        el.classList.toggle('filter-hidden', false);
        el.classList.toggle('page-hidden', !onPage);
        visibleIndex++;
        totalVisible++;
      } else {
        el.classList.add('filter-hidden');
        el.classList.add('page-hidden');
      }
    }

    renderFilterPagination(Math.ceil(totalVisible / state.perPage));
  }

  function restoreOriginalGrid() {
    state.injected = false;
    state.products = null;

    const grid = document.getElementById('main-collection-product-grid');
    grid.innerHTML = state.originalGridHTML;

    grid.querySelectorAll('template').forEach(elm => {
      elm.closest('form')?.append(elm.content.cloneNode(true));
    });

    const pagination = document.getElementById('collection-pagination');
    if (pagination) {
      pagination.innerHTML = state.originalPaginationHTML || '';
      pagination.style.display = state.originalPaginationHTML ? '' : 'none';
    }

    reinitComponents();
  }

  function renderFilterPagination(totalPages) {
    const container = document.getElementById('collection-pagination');
    if (!container) return;

    if (totalPages <= 1) {
      container.style.display = 'none';
      container.innerHTML = '';
      return;
    }

    container.style.display = '';

    const chevron = '<svg fill="none" height="7" viewBox="0 0 12 7" width="12" xmlns="http://www.w3.org/2000/svg"><g fill="#000"><path d="m1.2334.554688 5.65685 5.656852-.7071.70711-5.656858-5.65686z"/><path d="m11.8247 1.26221-5.65685 5.65685-.7071-.70711 5.65685-5.65685z"/></g></svg>';
    const page = state.filterPage;

    let items = '';

    if (page > 1) {
      items += '<li class="prev"><a href="#" data-filter-page="' + (page - 1) + '"><span class="visually-hidden">Previous</span><span aria-hidden="true">' + chevron + '</span></a></li>';
    } else {
      items += '<li class="prev disabled"><span class="visually-hidden">Previous</span><span aria-hidden="true">' + chevron + '</span></li>';
    }

    for (var i = 1; i <= totalPages; i++) {
      if (i === page) {
        items += '<li class="lap-hide active" aria-current="page"><span class="visually-hidden">page</span> ' + i + '</li>';
      } else {
        items += '<li class="lap-hide"><a href="#" data-filter-page="' + i + '"><span class="visually-hidden">page</span> ' + i + '</a></li>';
      }
    }

    items += '<li class="mobile"><div';
    if (page >= totalPages) items += ' style="margin-inline-end:-12px"';
    if (page <= 1) items += ' style="margin-inline-start:-12px"';
    items += '>' + page + ' / ' + totalPages + '</div></li>';

    if (page < totalPages) {
      items += '<li class="next"><a href="#" data-filter-page="' + (page + 1) + '"><span class="visually-hidden">Next</span><span aria-hidden="true">' + chevron + '</span></a></li>';
    } else {
      items += '<li class="next disabled"><span class="visually-hidden">Next</span><span aria-hidden="true">' + chevron + '</span></li>';
    }

    container.innerHTML = '<nav role="navigation"><ul class="pagination">' + items + '</ul></nav>';

    container.querySelectorAll('[data-filter-page]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        state.filterPage = parseInt(this.dataset.filterPage, 10);
        filterAndPaginate();
        var grid = document.getElementById('main-collection-product-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
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

      if (!hasActiveFilters()) {
        restoreOriginalGrid();
      } else {
        applyFilters();
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
