// Global removal of old non-functional keys if necessary

function addToCart(name, price, image, btn) {
    let cart = JSON.parse(localStorage.getItem("foodCart")) || [];

    // Find the quantity text safely based on your card layout
    let quantity = 1;
    if (btn && btn.parentElement) {
        let qtySpan = btn.parentElement.querySelector(".quantity-box span") || btn.parentElement.querySelector("span");
        if (qtySpan) {
            quantity = parseInt(qtySpan.innerText) || 1;
        }
    }

    // Check if item already exists in cart to update quantity, else add new
    let existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty = (existingItem.qty || 1) + quantity;
    } else {
        cart.push({
            name: name,
            price: Number(price),
            image: image,
            qty: quantity
        });
    }

    localStorage.setItem("foodCart", JSON.stringify(cart));
    alert(name + " Added To Cart!");
}

function increase(btn) {
    let qtySpan = btn.parentElement.querySelector("span");
    if (qtySpan) {
        qtySpan.innerText = parseInt(qtySpan.innerText) + 1;
    }
}

function decrease(btn) {
    let qtySpan = btn.parentElement.querySelector("span");
    if (qtySpan) {
        let currentQty = parseInt(qtySpan.innerText);
        if (currentQty > 1) {
            qtySpan.innerText = currentQty - 1;
        }
    }
}

// NEW: Increase quantity inside cart.html
function increaseCartQty(index) {
    let cart = JSON.parse(localStorage.getItem("foodCart")) || [];
    if (cart[index]) {
        cart[index].qty = (cart[index].qty || 1) + 1;
        localStorage.setItem("foodCart", JSON.stringify(cart));
        location.reload(); // Instantly update view tracking
    }
}

// NEW: Decrease quantity inside cart.html
function decreaseCartQty(index) {
    let cart = JSON.parse(localStorage.getItem("foodCart")) || [];
    if (cart[index]) {
        let currentQty = cart[index].qty || 1;
        if (currentQty > 1) {
            cart[index].qty = currentQty - 1;
            localStorage.setItem("foodCart", JSON.stringify(cart));
            location.reload(); // Instantly update view tracking
        } else {
            // Optional: If quantity drops below 1, remove the item completely
            removeFromCart(index);
        }
    }
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("foodCart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("foodCart", JSON.stringify(cart));
    location.reload(); 
}

function clearCart() {
    localStorage.removeItem("foodCart");
    location.reload();
}

function buyNow(product, price, image, btn) {

    let name = prompt("Enter your name");
    let address = prompt("Enter address");
    let phone = prompt("Enter phone number");

    if (!name || !address || !phone) {
        return;
    }

    let quantity = 1;

    if (btn && btn.parentElement) {
        let qtySpan = btn.parentElement.querySelector(".quantity-box span");

        if (qtySpan) {
            quantity = parseInt(qtySpan.innerText) || 1;
        }
    }

    let order = {
        product: product,
        price: Number(price) * quantity,
        image: image,
        qty: quantity,
        name: name,
        address: address,
        phone: phone
    };

    let orders =
        JSON.parse(localStorage.getItem("foodOrders")) || [];

    orders.push(order);

    localStorage.setItem(
        "foodOrders",
        JSON.stringify(orders)
    );

    alert("Order Placed Successfully!");

    window.location.href = "orders.html";
}


function cancelOrder(index){

    let orders =
        JSON.parse(localStorage.getItem("foodOrders")) || [];

    if(confirm("Are you sure you want to cancel this order?")){

        orders.splice(index,1);

        localStorage.setItem(
            "foodOrders",
            JSON.stringify(orders)
        );

        location.reload();
    }
}

