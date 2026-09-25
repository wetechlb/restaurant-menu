function filterMenu(category) {
  const items = document.querySelectorAll('.menu-item');
  const buttons = document.querySelectorAll('nav button');
  const featuredSlider = document.querySelector('.featured-slider');
  const searchInput = document.querySelector('#menu-search-input');
  const searchEmpty = document.querySelector('.search-empty');
  const searchTerm = searchInput?.value.trim().toLowerCase() || '';

  if (featuredSlider) {
    featuredSlider.hidden = category !== 'all' || searchTerm.length > 0;
  }

  // Show/hide items by category
  let visibleItems = 0;
  items.forEach(item => {
    const matchesCategory = category === 'all' || item.classList.contains(category);
    const matchesSearch = !searchTerm || item.textContent.toLowerCase().includes(searchTerm);
    const match = matchesCategory && matchesSearch;
    
    // 💡 FIX: Use 'flex' instead of 'block' to maintain the horizontal card layout
    item.style.display = match ? 'grid' : 'none';
    if (match) visibleItems += 1;
  });

  if (searchEmpty) searchEmpty.hidden = visibleItems > 0;

  // Handle active button class
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
}

const phoneNumber = '96181313067';
const LebanesePoundsPerDollar = 89500;
const cart = [];

function createCart() {
  const callButton = document.createElement('a');
  callButton.className = 'call-button';
  callButton.href = `tel:+${phoneNumber}`;
  callButton.textContent = '☎ Call';
  callButton.setAttribute('aria-label', 'Call for delivery');

  const cartButton = document.createElement('button');
  cartButton.className = 'cart-button';
  cartButton.type = 'button';
  cartButton.innerHTML = '🛍 Bag <span class="cart-count">0</span>';
  cartButton.addEventListener('click', () => {
    document.querySelector('.cart-panel').classList.add('is-open');
  });

  const cartPanel = document.createElement('aside');
  cartPanel.className = 'cart-panel';
  cartPanel.innerHTML = `
    <div class="cart-header">
      <h2>Your bag</h2>
      <button class="cart-close" type="button" aria-label="Close bag">&times;</button>
    </div>
    <div class="cart-items"></div>
    <p class="cart-empty">Your bag is empty.</p>
    <div class="cart-total">
      <span>Total</span>
      <strong><span class="total-lbp">0 L.L.</span><span class="total-usd">$0.00</span></strong>
    </div>
    <fieldset class="order-options">
      <legend class="payment-note">Choose an option</legend>
      <label><input type="radio" name="order-option" value="Cash on Delivery" checked> Cash on Delivery</label>
      <label><input type="radio" name="order-option" value="Take Away"> Take Away</label>
      <label><input type="radio" name="order-option" value="Wish Money"> Wish Money</label>
    </fieldset>
    <button class="checkout-button" type="button">Send order on WhatsApp</button>
  `;

  document.body.append(callButton, cartButton, cartPanel);
  cartPanel.querySelector('.cart-close').addEventListener('click', () => {
    cartPanel.classList.remove('is-open');
  });
  cartPanel.querySelector('.checkout-button').addEventListener('click', sendCartToWhatsApp);
}

function updateCart() {
  const cartItems = document.querySelector('.cart-items');
  const cartCount = document.querySelector('.cart-count');
  const cartEmpty = document.querySelector('.cart-empty');
  const checkoutButton = document.querySelector('.checkout-button');
  const cartTotalLbp = document.querySelector('.total-lbp');
  const cartTotalUsd = document.querySelector('.total-usd');

  cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const price = getNumericPrice(item.price);
    return price === null ? sum : sum + price * item.quantity;
  }, 0);
  const hasVariablePrice = cart.some(item => getNumericPrice(item.price) === null);
  cartTotalLbp.textContent = hasVariablePrice
    ? `${formatPrice(total)} L.L. + size prices`
    : `${formatPrice(total)} L.L.`;
  cartTotalUsd.textContent = total > 0
    ? `~ $${formatDollar(total / LebanesePoundsPerDollar)}`
    : '$0.00';
  cartItems.innerHTML = '';
  cartEmpty.hidden = cart.length > 0;
  checkoutButton.disabled = cart.length === 0;

  cart.forEach((item, index) => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <small>${item.price} L.L. <span>~ $${formatDollar(getNumericPrice(item.price) / LebanesePoundsPerDollar)}</span></small>
      </div>
      <div class="quantity-controls">
        <button type="button" data-action="decrease" aria-label="Decrease quantity">-</button>
        <span>${item.quantity}</span>
        <button type="button" data-action="increase" aria-label="Increase quantity">+</button>
        <button type="button" data-action="remove" aria-label="Remove item">&times;</button>
      </div>
    `;

    cartItem.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'increase') item.quantity += 1;
        if (action === 'decrease') item.quantity -= 1;
        if (action === 'remove' || item.quantity === 0) cart.splice(index, 1);
        updateCart();
      });
    });
    cartItems.appendChild(cartItem);
  });
}

function getPriceOptions(priceText) {
  if (typeof priceText !== 'string') return { regular: null, large: null };

  const regularMatch = priceText.match(/regular\s*[:\-]?\s*([\d.,]+)/i);
  const largeMatch = priceText.match(/large\s*[:\-]?\s*([\d.,]+)/i);

  return {
    regular: regularMatch ? Number(regularMatch[1].replace(/,/g, '')) : null,
    large: largeMatch ? Number(largeMatch[1].replace(/,/g, '')) : null,
  };
}

function getNumericPrice(priceText, variant = 'regular') {
  if (typeof priceText !== 'string') return null;

  const options = getPriceOptions(priceText);
  if (options.regular !== null || options.large !== null) {
    const selectedVariant = variant.toLowerCase() === 'large' ? options.large : options.regular;
    return selectedVariant ?? options.regular ?? options.large ?? null;
  }

  const numbers = Array.from(priceText.matchAll(/[\d.,]+/g), match => Number(match[0].replace(/,/g, '')));
  if (!numbers.length) return null;
  if (numbers.length > 1) {
    return variant.toLowerCase() === 'large' ? numbers[1] : numbers[0];
  }

  return numbers[0];
}

function hasSizePricing(priceText) {
  const options = getPriceOptions(priceText || '');
  return options.regular !== null && options.large !== null;
}

function formatPrice(price) {
  return price.toLocaleString('en-US');
}

function formatDollar(price) {
  return price.toFixed(2);
}

function showBagToast(itemName) {
  let toast = document.querySelector('.bag-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'bag-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = `${itemName} added to your bag`;
  toast.classList.remove('is-visible');
  void toast.offsetWidth;
  toast.classList.add('is-visible');
  window.clearTimeout(toast.hideTimer);
  toast.hideTimer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 1800);

  const cartButton = document.querySelector('.cart-button');
  cartButton.classList.remove('has-update');
  void cartButton.offsetWidth;
  cartButton.classList.add('has-update');
}

function addToCart(name, price) {
  const existingItem = cart.find(item => item.name === name && item.price === price);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  updateCart();
}

function sendCartToWhatsApp() {
  if (cart.length === 0) return;

  const order = cart.map(item => `${item.quantity}x ${item.name} - ${item.price}`).join('\n');
  const total = cart.reduce((sum, item) => {
    const price = getNumericPrice(item.price);
    return price === null ? sum : sum + price * item.quantity;
  }, 0);
  const hasVariablePrice = cart.some(item => getNumericPrice(item.price) === null);
  const totalText = hasVariablePrice
    ? `${formatPrice(total)} L.L. + size prices (~ $${formatDollar(total / LebanesePoundsPerDollar)})`
    : `${formatPrice(total)} L.L. (~ $${formatDollar(total / LebanesePoundsPerDollar)})`;
  const orderOption = document.querySelector('input[name="order-option"]:checked').value;
  const message = `Hello, I would like to order:\n${order}\n\nTotal: ${totalText}\nOption: ${orderOption}`;
  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function addOrderButtons() {

  document.querySelectorAll('.menu-item').forEach((item, index) => {
    const details = item.querySelector('.text-details');
    const name = details?.querySelector('h3')?.textContent.trim();
    const prices = details?.querySelector('.prices')?.textContent.trim()
      || Array.from(details?.querySelectorAll(':scope > span') || [])
        .map(price => price.textContent.trim())
        .join(' / ');

    if (!details || !name || item.querySelector('.order-button')) {
      return;
    }

    const sizeOptions = getPriceOptions(prices || '');
    const hasSizeOptions = sizeOptions.regular !== null && sizeOptions.large !== null;
    const sizeName = `size-${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    if (hasSizeOptions) {
      details.querySelectorAll('.prices').forEach(priceBlock => priceBlock.remove());

      const sizeSelector = document.createElement('div');
      sizeSelector.className = 'size-selector';
      sizeSelector.innerHTML = `
        <label data-size="regular">
          <input type="radio" name="${sizeName}" value="regular" checked>
          <span>Regular: ${formatPrice(sizeOptions.regular)}</span>
        </label>
        <label data-size="large">
          <input type="radio" name="${sizeName}" value="large">
          <span>Large: ${formatPrice(sizeOptions.large)}</span>
        </label>
      `;

      const syncSizeSelection = () => {
        sizeSelector.querySelectorAll('label').forEach(label => {
          const input = label.querySelector('input');
          label.classList.toggle('is-selected', input.checked);
        });
      };

      sizeSelector.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', syncSizeSelection);
      });
      syncSizeSelection();
      details.appendChild(sizeSelector);
    }

    const orderButton = document.createElement('button');
    orderButton.className = 'order-button';
    orderButton.type = 'button';
    orderButton.innerHTML = '🛍 Add to bag';
    orderButton.addEventListener('click', () => {
      let selectedPrice = prices || 'Price unavailable';

      if (hasSizeOptions) {
        const checkedInput = item.querySelector(`input[name="${sizeName}"]:checked`);
        const selectedVariant = checkedInput ? checkedInput.value : 'regular';
        const selectedValue = selectedVariant === 'large' ? sizeOptions.large : sizeOptions.regular;
        selectedPrice = `${selectedVariant === 'large' ? 'Large' : 'Regular'}: ${formatPrice(selectedValue)}`;
      }

      addToCart(name, selectedPrice);
      showBagToast(name);
      orderButton.classList.remove('is-added');
      void orderButton.offsetWidth;
      orderButton.classList.add('is-added');
      orderButton.innerHTML = '✓ Added to bag';
      window.setTimeout(() => {
        orderButton.classList.remove('is-added');
        orderButton.innerHTML = '🛍 Add to bag';
      }, 900);
    });
    item.appendChild(orderButton);
  });
}

function setupFeaturedSlider() {
  const slides = Array.from(document.querySelectorAll('.featured-slide'));
  const dots = Array.from(document.querySelectorAll('.featured-dots button'));
  const slider = document.querySelector('.featured-slider');
  let activeSlide = 0;

  function showSlide(slideIndex) {
    activeSlide = (slideIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle('is-active', index === activeSlide));
    dots.forEach((dot, index) => dot.classList.toggle('is-active', index === activeSlide));
  }

  document.querySelector('.featured-prev').addEventListener('click', () => showSlide(activeSlide - 1));
  document.querySelector('.featured-next').addEventListener('click', () => showSlide(activeSlide + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));

  document.querySelectorAll('.featured-add').forEach(button => {
    button.addEventListener('click', () => {
      addToCart(button.dataset.name, button.dataset.price);
      showBagToast(button.dataset.name);
      button.textContent = 'Added to bag';
      window.setTimeout(() => {
        button.textContent = 'Add to bag';
      }, 900);
    });
  });

  let rotationTimer = window.setInterval(() => showSlide(activeSlide + 1), 5000);
  slider.addEventListener('mouseenter', () => window.clearInterval(rotationTimer));
  slider.addEventListener('mouseleave', () => {
    rotationTimer = window.setInterval(() => showSlide(activeSlide + 1), 5000);
  });
}

// Attach event listeners to buttons
document.querySelectorAll('nav button').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.category;
    filterMenu(category);
  });
});

document.querySelector('#menu-search-input')?.addEventListener('input', () => {
  const activeButton = document.querySelector('nav button.active');
  filterMenu(activeButton?.dataset.category || 'all');
});

const menuTools = document.querySelector('.menu-tools');
const searchToggle = document.querySelector('.search-toggle');
const menuSearchInput = document.querySelector('#menu-search-input');

searchToggle?.addEventListener('click', () => {
  const isOpen = menuTools.classList.toggle('search-open');
  searchToggle.setAttribute('aria-expanded', String(isOpen));
  searchToggle.setAttribute('aria-label', isOpen ? 'Close menu search' : 'Open menu search');

  if (isOpen) {
    menuSearchInput.focus();
  } else {
    menuSearchInput.value = '';
    const activeButton = document.querySelector('nav button.active');
    filterMenu(activeButton?.dataset.category || 'all');
  }
});

// Initial call to show all
createCart();
addOrderButtons();
setupFeaturedSlider();
filterMenu('all');
