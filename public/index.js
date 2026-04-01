let pizzas = [];
let selectedPizza = null;
let elements = {};

window.onload = function () {
    // Initializing common elements with the structure from the main branch
    elements = {
        qty: document.getElementById('qty'),
        pizzaList: document.getElementById('pizzaList'),
        result: document.getElementById('result'),
        promo: document.getElementById('promo'),
        email: document.getElementById('email'), // Missing in main, from feature/test
        summaryName: document.getElementById('summaryName'),
        summaryPrice: document.getElementById('summaryPrice'),
        totalHT: document.getElementById('totalHT'),
        totalTVA: document.getElementById('totalTVA'),
        pizzas: []
    }

    // Set up quantities adjustments through the existing buttons
    document.querySelectorAll('.setQty').forEach(btn => {
        btn.addEventListener('click', () => {
            changeQty(btn.textContent.trim() === '+' ? 1 : -1);
        });
    });

    // Set up order placement logic on button click
    const orderBtn = document.getElementById('order');
    if (orderBtn) {
        orderBtn.addEventListener("click", placeOrder);
    } else {
        // Falling back to a button that may call placeOrder inline or have no ID
        // Note: index.html was updated in Step 142/257, ensuring a consistent setup is key
    }

    // Perform initial pizza list retrieval
    fetch('/pizzas')
        .then(r => r.json())
        .then(data => {
            pizzas = data;
            renderPizzas();
        });
}

function renderPizzas() {
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
    // Update global pizzas elements to the actual nodes for easier manipulation
    elements.pizzas = document.querySelectorAll('#pizzaList > div');
}

function selectPizza(pizza, el) {
    if (elements.pizzas) {
        elements.pizzas.forEach(d => d.classList.remove('border-black'));
    }
    el.classList.add('border-black');
    selectedPizza = pizza;
    updateSummary();
}

function changeQty(delta) {
    elements.qty.value = Math.max(1, Number(elements.qty.value) + delta);
    updateSummary();
}

function updateSummary() {
    if (!selectedPizza) return;
    const qty = Number(elements.qty.value);
    elements.summaryName.innerText = `${selectedPizza.name} x${qty}`;
    elements.summaryPrice.innerText = `${selectedPizza.price * qty}€`;
    elements.totalHT.innerText = `${selectedPizza.price * qty}€`;
    elements.totalTVA.innerText = `${Math.round(selectedPizza.price * qty * 1.1 * 100) / 100}€`;
}

function placeOrder() {
    if (!selectedPizza) return;

    fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: [{
                pizzaId: selectedPizza.id,
                qty: Number(elements.qty.value)
            }],
            promoCode: elements.promo.value,
            email: elements.email.value // Kept from feature/test/fix logic
        })
    })
        .then(r => r.json())
        .then(data => {
            elements.result.innerText = JSON.stringify(data, null, 2);
        });
}
