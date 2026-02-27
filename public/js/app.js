// --- Data ---
const menuData = [
    {
        id: 1,
        name: "Classic Cheeseburger",
        price: 899,
        category: "burger",
        description: "Juicy beef patty, cheddar cheese, crisp lettuce, tomato, and our signature sauce.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 2,
        name: "Spicy Chicken Burger",
        price: 999,
        category: "burger",
        description: "Crispy fried chicken breast, spicy mayo, pickles on a toasted brioche bun.",
        image: "https://images.unsplash.com/photo-1615557960916-5f4791effe9d?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 3,
        name: "Margherita Pizza",
        price: 450,
        category: "pizza",
        description: "Classic Neapolitan pizza with San Marzano tomatoes, fresh mozzarella, and basil.",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 4,
        name: "Pepperoni Feast",
        price: 399,
        category: "pizza",
        description: "Loaded with double pepperoni and extra mozzarella cheese.",
        image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 5,
        name: "Pad Thai Noodles",
        price: 200,
        category: "asian",
        description: "Stir-fried rice noodles with eggs, peanuts, bean sprouts, and tangy tamarind sauce.",
        image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 6,
        name: "Sushi Combo Master",
        price: 220,
        category: "asian",
        description: "Chef's selection of premium nigiri, sashimi, and two signature rolls.",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 7,
        name: "Molten Lava Cake",
        price: 750,
        category: "dessert",
        description: "Warm chocolate cake with a gooey center, served with vanilla bean ice cream.",
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=600&auto=format&fit=crop"
    },
    {
        id: 8,
        name: "New York Cheesecake",
        price: 699,
        category: "dessert",
        description: "Rich and creamy classic cheesecake with a graham cracker crust and berry compote.",
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop"
    }
];

// --- State ---
let cart = JSON.parse(localStorage.getItem('cravebite_cart')) || [];

// --- DOM Elements ---
const menuGrid = document.getElementById('menu-grid');
const categoryBtns = document.querySelectorAll('.category-btn');
const cartIcon = document.getElementById('cart-icon');
const cartCount = document.getElementById('cart-count');
const cartOverlay = document.getElementById('cart-overlay');
const closeCart = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');

// Checkout DOM
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutModal = document.getElementById('close-modal');
const checkoutFinalTotal = document.getElementById('checkout-final-total');
const checkoutForm = document.getElementById('checkout-form');
const checkoutMsg = document.getElementById('checkout-msg');
const submitOrderBtn = document.getElementById('submit-order-btn');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    renderMenu('all');
    updateCartUI();

    // Event Listeners for Cart
    cartIcon.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);

    // Checkout Modal
    proceedCheckoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        toggleCart(); // Close cart
        checkoutModal.classList.add('active'); // Open Modal
    });
    closeCheckoutModal.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
        checkoutMsg.className = 'checkout-msg';
        checkoutMsg.innerText = '';
    });

    // Category filtering
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderMenu(e.target.dataset.category);
        });
    });

    // Form Submission
    checkoutForm.addEventListener('submit', handleCheckout);
});

// --- Functions ---
function renderMenu(category) {
    menuGrid.innerHTML = '';

    const filteredMenu = category === 'all'
        ? menuData
        : menuData.filter(item => item.category === category);

    filteredMenu.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="menu-img" loading="lazy">
            <div class="menu-info">
                <h3>${item.name} <span class="menu-price">₹${item.price.toFixed(2)}</span></h3>
                <p class="menu-desc">${item.description}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
        menuGrid.appendChild(card);
    });
}

function toggleCart() {
    cartOverlay.classList.toggle('active');
}

function addToCart(id) {
    const product = menuData.find(item => item.id === id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();

    // Micro-animation user feedback
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => { cartIcon.style.transform = 'scale(1)'; }, 200);
}

function updateQuantity(id, change) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        saveCart();
        updateCartUI();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('cravebite_cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Update Badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = totalItems;

    // Render Items
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Your cart is empty.</p>
            </div>
        `;
        cartTotalPrice.innerText = '₹0.00';
        checkoutFinalTotal.innerText = '₹0.00';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <div class="item-price">₹${item.price.toFixed(2)}</div>
                <div class="item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <i class="fa-solid fa-trash remove-item" onclick="removeFromCart(${item.id})"></i>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });

    cartTotalPrice.innerText = `₹${total.toFixed(2)}`;
    checkoutFinalTotal.innerText = `₹${total.toFixed(2)}`;
}

async function handleCheckout(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const payment = document.querySelector('input[name="payment"]:checked').value;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderData = {
        customer: { name, email, address, payment },
        items: cart,
        total: total
    };

    submitOrderBtn.disabled = true;
    submitOrderBtn.innerText = 'Processing...';
    checkoutMsg.className = 'checkout-msg';
    checkoutMsg.innerText = '';

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            checkoutMsg.classList.add('success');
            checkoutMsg.innerText = 'Order placed successfully! Redirecting...';

            // Clear cart
            cart = [];
            saveCart();
            updateCartUI();

            setTimeout(() => {
                checkoutModal.classList.remove('active');
                checkoutForm.reset();
                submitOrderBtn.disabled = false;
                submitOrderBtn.innerHTML = `Place Order - <span id="checkout-final-total">$0.00</span>`;
            }, 2500);
        } else {
            throw new Error('Server returned an error.');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        checkoutMsg.classList.add('error');
        checkoutMsg.innerText = 'Failed to place order. Please try again.';
        submitOrderBtn.disabled = false;
        submitOrderBtn.innerHTML = `Place Order - <span id="checkout-final-total">₹${total.toFixed(2)}</span>`;
    }
}
