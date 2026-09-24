function filterMenu(category) {
  const items = document.querySelectorAll('.menu-item');
  const buttons = document.querySelectorAll('nav button');

  // Show/hide items by category
  items.forEach(item => {
    const match = category === 'all' || item.classList.contains(category);
    
    // 💡 FIX: Use 'flex' instead of 'block' to maintain the horizontal card layout
    item.style.display = match ? 'grid' : 'none';
  });

  // Handle active button class
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
}

const phoneNumber = '96181313067';
const cart = [];

function createCart() {
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
    <div class="cart-total">Total: <strong>0</strong></div>
    <button class="checkout-button" type="button">Send order on WhatsApp</button>
  `;

  document.body.append(cartButton, cartPanel);
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
  const cartTotal = document.querySelector('.cart-total strong');

  cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const price = getNumericPrice(item.price);
    return price === null ? sum : sum + price * item.quantity;
  }, 0);
  const hasVariablePrice = cart.some(item => getNumericPrice(item.price) === null);
  cartTotal.textContent = hasVariablePrice
    ? `${formatPrice(total)} + size prices`
    : formatPrice(total);
  cartItems.innerHTML = '';
  cartEmpty.hidden = cart.length > 0;
  checkoutButton.disabled = cart.length === 0;

  cart.forEach((item, index) => {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <small>${item.price}</small>
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

function getNumericPrice(priceText) {
  if (/regular|large/i.test(priceText)) {
    return null;
  }

  const number = priceText.match(/[\d.,]+/)?.[0];
  return number ? Number(number.replace(/[.,]/g, '')) : null;
}

function formatPrice(price) {
  return price.toLocaleString('en-US');
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
    ? `${formatPrice(total)} + size prices`
    : formatPrice(total);
  const message = `Hello, I would like to order:\n${order}\n\nTotal: ${totalText}`;
  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

function addOrderButtons() {

  document.querySelectorAll('.menu-item').forEach(item => {
    const details = item.querySelector('.text-details');
    const name = details?.querySelector('h3')?.textContent.trim();
    const prices = details?.querySelector('.prices')?.textContent.trim()
      || Array.from(details?.querySelectorAll(':scope > span') || [])
        .map(price => price.textContent.trim())
        .join(' / ');

    if (!details || !name || item.querySelector('.order-button')) {
      return;
    }

    const orderButton = document.createElement('button');
    orderButton.className = 'order-button';
    orderButton.type = 'button';
    orderButton.innerHTML = '🛍 Add to bag';
    orderButton.addEventListener('click', () => addToCart(name, prices || 'Price unavailable'));
    item.appendChild(orderButton);
  });
}

// Attach event listeners to buttons
document.querySelectorAll('nav button').forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.category;
    filterMenu(category);
  });
});

// Initial call to show all
createCart();
addOrderButtons();
filterMenu('all');