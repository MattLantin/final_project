const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
const cartContainer = document.getElementById('cartContainer');
const buttonContainer = document.getElementById('buttonContainer');

if (cart.length === 0) {
  const empty = document.createElement('p');
  empty.textContent = 'Your cart is empty! Subscribe today to turn some heads and start building a physique that rivals this one!';
  empty.style.color = '#ccc';
  empty.style.fontSize = '1.5rem';
  empty.style.fontWeight = 'bold';
  cartContainer.appendChild(empty);
} else {
  let total = 0;
  cart.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('cart-card');

    const text = document.createElement('p');
    const itemTotal = item.price;
    total += itemTotal;

    const description = {
      "Starter": "Get 100 messages a month, basic NLP to power your moves, and no integrations—just the essentials to get you started!",
      "Pro": "5,000 messages per month, a personality that’s all yours, and seamless integrations with Slack, Discord, or your website—get ready to take it to the next level!",
      "Elite": "Unlimited messages, a memory that never forgets, and the power to upload your own data—this is the full package!",
    };

    let extraInfo = description[item.name] || "";

    text.innerHTML = `<strong>${item.name}</strong> — $${item.price.toFixed(2)}<br><small style="color:#aaa;">${extraInfo}</small>`;
    
    card.appendChild(text);
    cartContainer.appendChild(card);
  });

  const totalText = document.createElement('div');
  totalText.classList.add('total-text');
  totalText.textContent = `Your Total is: $${total}`;
  cartContainer.appendChild(totalText);

  const checkoutBtn = document.createElement('a');
  checkoutBtn.textContent = 'Checkout';
  checkoutBtn.classList.add('cta');
  checkoutBtn.onclick = () => {
    Swal.fire({
      title: 'Processing...',
      text: 'Please wait while we complete your order.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    fetch('/submit-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, total })
    })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        setTimeout(() => {
          Swal.close();
          Swal.fire({
            title: 'Order Complete!',
            text: 'Thanks for your purchase!',
            icon: 'success',
            confirmButtonText: 'Awesome!'
          }).then(() => {
            window.location.href = 'index.html';
          });

          confetti({
            particleCount: 200,
            spread: 70,
            origin: { y: 0.6 }
          });

          sessionStorage.removeItem('cart');
        }, 1000);
      } else {
        Swal.fire({
          title: 'Error',
          text: res.error || 'Something went wrong!',
          icon: 'error'
        });
      }
    });
  };
  buttonContainer.appendChild(checkoutBtn);
}
