function filterMenu(category) {
  const items = document.querySelectorAll('.menu-item');
  const buttons = document.querySelectorAll('nav button');

  // Show/hide items by category
  items.forEach(item => {
    const match = category === 'all' || item.classList.contains(category);
    
    // 💡 FIX: Use 'flex' instead of 'block' to maintain the horizontal card layout
    item.style.display = match ? 'flex' : 'none';
  });

  // Handle active button class
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
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
filterMenu('all');