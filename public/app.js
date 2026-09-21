const form = document.querySelector('#product-form');
const productsElement = document.querySelector('#products');
const messageElement = document.querySelector('#message');
const nameInput = document.querySelector('#product-name');
const descriptionInput = document.querySelector('#product-description');
const priceInput = document.querySelector('#product-price');

function showMessage(message = '') {
  messageElement.textContent = message;
}

function createProductElement(product) {
  const item = document.createElement('article');
  const details = document.createElement('div');
  const title = document.createElement('h3');
  const description = document.createElement('p');
  const deleteButton = document.createElement('button');

  item.className = 'product';
  title.textContent = `${product.name} - $${Number(product.price).toFixed(2)}`;
  description.textContent = product.description || 'No description';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => deleteProduct(product.id));

  details.append(title, description);
  item.append(details, deleteButton);
  return item;
}

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Could not load products.');
    const products = await response.json();
    productsElement.replaceChildren();

    if (products.length === 0) {
      productsElement.innerHTML = '<p class="empty">No products yet.</p>';
      return;
    }

    products.forEach((product) => productsElement.append(createProductElement(product)));
  } catch (error) {
    productsElement.innerHTML = `<p class="empty">${error.message}</p>`;
  }
}

async function deleteProduct(id) {
  const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    showMessage('Product could not be deleted.');
    return;
  }
  loadProducts();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  showMessage();

  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: nameInput.value.trim(),
      description: descriptionInput.value.trim(),
      price: priceInput.value,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    showMessage(error.error || 'Product could not be added.');
    return;
  }

  form.reset();
  loadProducts();
});

loadProducts();