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

function addOrderButtons() {
  const phoneNumber = '96181313067';

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

    const message = `Hello, I would like to order: ${name}${prices ? ` - ${prices}` : ''}`;
    const orderButton = document.createElement('a');
    orderButton.className = 'order-button';
    orderButton.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    orderButton.target = '_blank';
    orderButton.rel = 'noopener noreferrer';
    orderButton.textContent = 'Order on WhatsApp';
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
addOrderButtons();
filterMenu('all');