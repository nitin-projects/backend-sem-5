// index.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Fashion Product Data ---
    const products = [
        { id: 1, name: "Ribbed knit sweater", price: 34.99, category: "clothing", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80" },
        { id: 2, name: "Wide High Jeans", price: 39.99, category: "clothing", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&q=80" },
        { id: 3, name: "Chunky loafers", price: 49.99, category: "shoes", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80" },
        { id: 4, name: "Small shoulder bag", price: 19.99, category: "accessories", image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=500&q=80" },
        { id: 5, name: "Oversized jacket", price: 59.99, category: "clothing", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80" },
        { id: 6, name: "Canvas trainers", price: 29.99, category: "shoes", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&q=80" },
        { id: 7, name: "Ribbed beanie", price: 12.99, category: "accessories", image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80" },
        { id: 8, name: "Tailored trousers", price: 44.99, category: "clothing", image: "https://images.unsplash.com/photo-1594938298596-03fd6299d418?w=500&q=80" }
    ];

    // --- 2. State Management ---
    let cart = [];
    let currentCategory = 'all';
    let currentSort = 'default';
    let discountApplied = false;
    const TAX_RATE = 0.10; // 10%
    const DISCOUNT_RATE = 0.20; // 20%

    // --- 3. DOM Elements ---
    const productGrid = document.getElementById('product-grid');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMsg = document.getElementById('empty-cart-msg');
    const cartBadge = document.getElementById('cart-badge');
    const subtotalDisplay = document.getElementById('subtotal-display');
    const taxDisplay = document.getElementById('tax-display');
    const discountRow = document.getElementById('discount-row');
    const discountDisplay = document.getElementById('discount-display');
    const totalDisplay = document.getElementById('total-display');
    const couponInput = document.getElementById('coupon-input');
    const applyCouponBtn = document.getElementById('apply-coupon');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartToggleBtn = document.getElementById('cart-toggle');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const toastContainer = document.getElementById('toast-container');

    // --- 4. Product Rendering ---
    function renderProducts() {
        if (!productGrid) return; // Safety check
        productGrid.innerHTML = '';
        
        let filteredProducts = products.filter(p => currentCategory === 'all' || p.category === currentCategory);
        
        if (currentSort === 'price-low') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (currentSort === 'price-high') {
            filteredProducts.sort((a, b) => b.price - a.price);
        }

        filteredProducts.forEach(product => {
            const div = document.createElement('div');
            div.className = 'flex flex-col group cursor-pointer';
            div.innerHTML = `
                <div class="relative overflow-hidden bg-gray-100 mb-3">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700">
                    <button onclick="addToCart(${product.id})" class="absolute bottom-4 right-4 bg-white text-black w-10 h-10 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-200">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
                <h3 class="text-sm text-gray-800 font-medium">${product.name}</h3>
                <span class="text-sm font-bold text-gray-900 mt-1">$${product.price.toFixed(2)}</span>
            `;
            productGrid.appendChild(div);
        });
    }

    // --- 5. Global Cart Functions ---
    window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        const existingItem = cart.find(item => item.product.id === productId);
        if (existingItem) existingItem.quantity += 1;
        else cart.push({ product, quantity: 1 });
        updateCartUI();
        showToast(`${product.name} added`);
        
        // Auto open cart
        if(cartSidebar.classList.contains('translate-x-full')){
            toggleCart();
        }
    };

    window.updateQuantity = function(productId, change) {
        const itemIndex = cart.findIndex(item => item.product.id === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) cart.splice(itemIndex, 1);
            updateCartUI();
        }
    };

    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.product.id !== productId);
        updateCartUI();
    };

    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        cartBadge.classList.toggle('hidden', totalItems === 0);

        const existingItems = document.querySelectorAll('.cart-item-row');
        existingItems.forEach(el => el.remove());

        if (cart.length === 0) {
            emptyCartMsg.style.display = 'block';
            checkoutBtn.disabled = true;
        } else {
            emptyCartMsg.style.display = 'none';
            checkoutBtn.disabled = false;
            
            cart.forEach(item => {
                const div = document.createElement('div');
                div.className = 'cart-item-row flex gap-4';
                div.innerHTML = `
                    <img src="${item.product.image}" class="w-20 h-28 object-cover bg-gray-100">
                    <div class="flex-1 flex flex-col justify-between py-1">
                        <div class="flex justify-between items-start">
                            <h4 class="font-medium text-sm text-gray-900">${item.product.name}</h4>
                            <button onclick="removeFromCart(${item.product.id})" class="text-gray-400 hover:text-black transition"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                        <div class="flex justify-between items-end">
                            <div class="flex items-center border border-gray-300">
                                <button onclick="updateQuantity(${item.product.id}, -1)" class="px-3 py-1 text-gray-600 hover:bg-gray-100 transition">-</button>
                                <span class="px-3 py-1 text-sm font-medium border-x border-gray-300">${item.quantity}</span>
                                <button onclick="updateQuantity(${item.product.id}, 1)" class="px-3 py-1 text-gray-600 hover:bg-gray-100 transition">+</button>
                            </div>
                            <span class="font-bold text-sm text-gray-900">$${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(div);
            });
        }
        calculateTotals();
    }

    function calculateTotals() {
        let subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        let discountAmount = discountApplied ? (subtotal * DISCOUNT_RATE) : 0;
        let afterDiscount = subtotal - discountAmount;
        let tax = afterDiscount * TAX_RATE;
        let total = afterDiscount + tax;

        subtotalDisplay.textContent = `$${subtotal.toFixed(2)}`;
        
        if (discountApplied && subtotal > 0) {
            discountRow.style.display = 'flex';
            discountDisplay.textContent = `-$${discountAmount.toFixed(2)}`;
        } else {
            discountRow.style.display = 'none';
        }

        taxDisplay.textContent = `$${tax.toFixed(2)}`;
        totalDisplay.textContent = `$${total.toFixed(2)}`;
    }

    // --- 6. Event Listeners ---
    categoryFilter.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        renderProducts();
    });

    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderProducts();
    });

    applyCouponBtn.addEventListener('click', () => {
        const code = couponInput.value.trim().toUpperCase();
        if (cart.length === 0) return showToast("Your bag is empty!", "error");
        
        if (code === 'SAVE20') {
            discountApplied = true;
            couponInput.disabled = true;
            applyCouponBtn.disabled = true;
            applyCouponBtn.textContent = 'Applied';
            calculateTotals();
            showToast("Promo code applied!");
        } else {
            showToast("Invalid promo code.", "error");
        }
    });

    function toggleCart() {
        cartSidebar.classList.toggle('translate-x-full');
        cartOverlay.classList.toggle('hidden');
        document.body.style.overflow = document.body.style.overflow === 'hidden' ? '' : 'hidden';
    }

    cartToggleBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    checkoutBtn.addEventListener('click', () => {
        alert('Proceeding to checkout...');
        cart = [];
        discountApplied = false;
        couponInput.value = '';
        couponInput.disabled = false;
        applyCouponBtn.disabled = false;
        applyCouponBtn.textContent = 'Apply';
        updateCartUI();
        toggleCart();
    });

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-black' : 'bg-red-600';
        toast.className = `${bgColor} text-white px-5 py-3 shadow-lg flex items-center gap-3 toast-enter font-medium text-sm tracking-wide`;
        toast.innerHTML = `<span>${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => { toast.classList.remove('toast-enter'); toast.classList.add('toast-active'); }, 10);
        setTimeout(() => {
            toast.classList.remove('toast-active'); toast.classList.add('toast-leave');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 2000);
    }

    // --- 7. Initialize ---
    renderProducts();
});