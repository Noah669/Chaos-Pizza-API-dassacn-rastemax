let pizzas = [];
let selectedPizza = null;
let elements = {};

window.onload = function () {
    // Initializing all the DOM elements into a single object for organized access
    elements = {
        qty: document.getElementById('qty'),
        pizzaList: document.getElementById('pizzaList'),
        result: document.getElementById('result'),
        promo: document.getElementById('promo'),
        email: document.getElementById('email'), // email is required by the API
        summaryName: document.getElementById('summaryName'),
        summaryPrice: document.getElementById('summaryPrice'),
        totalHT: document.getElementById('totalHT'),
        totalTVA: document.getElementById('totalTVA'),
        pizzas: []
    }

    // Assigning quantity modification listeners to any '+' or '-' buttons
    document.querySelectorAll('.setQty').forEach(btn => {
        btn.addEventListener('click', () => {
            changeQty(btn.textContent.trim() === '+' ? 1 : -1);
        });
    });

    // Assigning the order placement logic to the order button
    const orderBtn = document.getElementById('order');
    if (orderBtn) {
        orderBtn.addEventListener("click", placeOrder);
    } else {
        // In case the button in index.html is different: try placing another selector if needed
    }

    // Initial fetch to load the menu
    fetch('/pizzas')
        .then(r => r.json())
        .then(data => {
            pizzas = data;
            renderPizzas();
        });
}

/**
 * Renders the list of pizzas from the menu.
 */
function renderPizzas() {
    if (!elements.pizzaList) return;
    elements.pizzaList.innerHTML = '';

    pizzas.forEach(p => {
        const div = document.createElement('div');
        div.className =
            'flex justify-between items-center p-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50';
        div.innerHTML = `
      <span class="font-medium">${p.name}</span>
      <span class="text-gray-500">${p.price}€</span>
    `;
        div.onclick = () => selectPizza(p, div);
        elements.pizzaList.appendChild(div);
    });

    // Keeping a live reference to the rendered pizza divs for style manipulation
    elements.pizzas = document.querySelectorAll('#pizzaList > div');
}

/**
 * Handles pizza selection from the list.
 */
function selectPizza(pizza, el) {
    if (elements.pizzas) {
        elements.pizzas.forEach(d => d.classList.remove('border-black'));
    }
    el.classList.add('border-black');
    selectedPizza = pizza;
    updateSummary();
}

/**
 * Changes the order quantity.
 */
function changeQty(delta) {
    if (elements.qty) {
        elements.qty.value = Math.max(1, Number(elements.qty.value) + delta);
        updateSummary();
    }
}

/**
 * Updates the visual order summary based on current selection and quantity.
 */
function updateSummary() {
    if (!selectedPizza || !elements.qty) return;

    const qty = Number(elements.qty.value);
    console.log(`Updating summary: ${qty}x ${selectedPizza.name}`);

    if (elements.summaryName) elements.summaryName.innerText = `${selectedPizza.name} x${qty}`;
    if (elements.summaryPrice) elements.summaryPrice.innerText = `${selectedPizza.price * qty}€`;
    if (elements.totalHT) elements.totalHT.innerText = `${selectedPizza.price * qty}€`;
    if (elements.totalTVA) {
        // Calculating total with TVA (10% inflation/tax factor)
        elements.totalTVA.innerText = `${Math.round(selectedPizza.price * qty * 1.1 * 100) / 100}€`;
    }
}

/**
 * Sends the order data to the server.
 */
function placeOrder() {
    if (!selectedPizza) {
        alert("Please select a pizza first!");
        return;
    }

    if (!elements.email || !elements.email.value.trim()) {
        alert("Email is required to place an order.");
        return;
    }

    fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: [{
                pizzaId: selectedPizza.id,
                qty: Number(elements.qty.value)
            }],
            promoCode: elements.promo ? elements.promo.value : "",
            email: elements.email.value
        })
    })
        .then(r => r.json())
        .then(data => {
            if (elements.result) {
                elements.result.innerText = JSON.stringify(data, null, 2);
            }
        })
        .catch(err => {
            if (elements.result) {
                elements.result.innerText = "Error: " + err.message;
            }
        });
}
