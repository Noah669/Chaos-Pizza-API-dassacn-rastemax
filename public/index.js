let pizzas = [];
let selectedPizza = null;

fetch('/pizzas')
    .then(r => r.json())
    .then(data => {
        pizzas = data;
        renderPizzas();
    });

function renderPizzas() {
    const list = document.getElementById('pizzaList');
    list.innerHTML = '';

    pizzas.forEach(p => {
        const div = document.createElement('div');
        div.className =
            'flex justify-between items-center p-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50';
        div.innerHTML = `
      <span class="font-medium">${p.name}</span>
      <span class="text-gray-500">${p.price}€</span>
    `;
        div.onclick = () => selectPizza(p, div);
        list.appendChild(div);
    });
}

function selectPizza(pizza, el) {
    document.querySelectorAll('#pizzaList > div')
        .forEach(d => d.classList.remove('border-black'));
    el.classList.add('border-black');
    selectedPizza = pizza;
    updateSummary();
}

function changeQty(delta) {
    const input = document.getElementById('qty');
    input.value = Math.max(1, Number(input.value) + delta);
    updateSummary();
}

function updateSummary() {
    if (!selectedPizza) return;
    const qty = Number(document.getElementById('qty').value);
    console.log(qty);
    document.getElementById('summaryName').innerText =
        `${selectedPizza.name} x${qty}`;
    document.getElementById('summaryPrice').innerText =
        `${selectedPizza.price * qty}€`;
    document.getElementById('totalHT').innerText =
        `${selectedPizza.price * qty}€`;
    document.getElementById('totalTVA').innerText = `${Math.round(selectedPizza.price * qty * 1.1 * 100) / 100}€`;
}

function placeOrder() {
    if (!selectedPizza) return;

    fetch('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: [{
                pizzaId: selectedPizza.id,
                qty: Number(document.getElementById('qty').value)
            }],
            promoCode: document.getElementById('promo').value,
            email: document.getElementById('email').value
        })
    })
        .then(r => r.json())
        .then(data => {
            document.getElementById('result').innerText =
                JSON.stringify(data, null, 2);
        });
}
