// ==========================================
// 1. DNS BYPASS RULE FOR ISP BLOCKS (MUST BE FIRST)
// ==========================================
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Forces Node to bypass router DNS failures

// ==========================================
// 2. CORE MODULE INITIALISATION
// ==========================================
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// Serve your frontend HTML, CSS, and JS files out of your /public folder
app.use(express.static(path.join(__dirname, "public")));

// ==========================================
// 3. SECURE MONGOOSE CONNECTION CONTEXT 
// ==========================================
const MONGO_URI = "mongodb+srv://emergencyAdmin:1507009150spyro@cluster0.fhuzgoa.mongodb.net/foodiesHub?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB Atlas connected successfully ✅"))
.catch(err => {
    console.log("❌ DB Connection Error:", err.message);
    console.log("👉 If this still times out, connect your computer to your Mobile Phone Hotspot to unblock port 27017.");
});

// ==========================================
// 4. DATABASE SCHEMAS & MODELS
// ==========================================

// Cart Tracking Architecture
const CartSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    qty: { type: Number, default: 1 }
});
const CartItem = mongoose.model("CartItem", CartSchema);

// Order Dispatch Invoicing Architecture
const OrderSchema = new mongoose.Schema({
    product: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    qty: { type: Number, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, default: "Order Placed" },
    date: { type: String, default: () => new Date().toLocaleDateString() }
});
const OrderItem = mongoose.model("OrderItem", OrderSchema);

// ==========================================
// 5. REST API ROUTING ENDPOINTS
// ==========================================

// [GET] Retrieve full active cart list
app.get("/api/cart", async (req, res) => {
    try {
        const cart = await CartItem.find();
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [POST] Push item to shopping cart or increment quantities if present
app.post("/api/cart", async (req, res) => {
    try {
        const { name, price, image, qty } = req.body;
        
        let existingItem = await CartItem.findOne({ name });
        if (existingItem) {
            existingItem.qty += Number(qty);
            await existingItem.save();
            return res.status(200).json({ message: "Quantity updated successfully" });
        }

        const newItem = new CartItem({ name, price: Number(price), image, qty: Number(qty) });
        await newItem.save();
        res.status(201).json({ message: "Item added to cart collection" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [POST] Adjust quantities directly from inside cart.html buttons (+ / -)
app.post("/api/cart/update", async (req, res) => {
    try {
        const { name, action } = req.body;
        const item = await CartItem.findOne({ name });
        
        if (!item) return res.status(404).json({ message: "Product context not found" });

        if (action === "increase") {
            item.qty += 1;
            await item.save();
        } else if (action === "decrease") {
            item.qty -= 1;
            if (item.qty <= 0) {
                await CartItem.deleteOne({ name });
                return res.status(200).json({ message: "Item purged from collection database" });
            }
            await item.save();
        }
        res.status(200).json({ message: "Cart counter state modified" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [POST] Delete a specific food item completely from cart list rows
app.post("/api/cart/remove", async (req, res) => {
    try {
        const { name } = req.body;
        await CartItem.deleteOne({ name });
        res.status(200).json({ message: "Product row dropped" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [POST] Purge cart collection upon checkout execution
app.post("/api/cart/clear", async (req, res) => {
    try {
        await CartItem.deleteMany({});
        res.status(200).json({ message: "Active cart flushed clean" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [POST] Dispatch processing transaction record to orders tracking collection
app.post("/api/orders", async (req, res) => {
    try {
        const { product, price, image, qty, name, address, phone } = req.body;
        const order = new OrderItem({ product, price: Number(price), image, qty: Number(qty), name, address, phone });
        await order.save();
        res.status(201).json({ message: "Invoice document structured successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [GET] Pull complete historical client order array block
app.get("/api/orders", async (req, res) => {
    try {
        const orders = await OrderItem.find().sort({ _id: -1 }); // Newest invoices appear first
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// [POST] Cancel a transaction using its exact data node identifier hash
app.post("/api/orders/cancel", async (req, res) => {
    try {
        const { id } = req.body;
        await OrderItem.findByIdAndDelete(id);
        res.status(200).json({ message: "Invoice document successfully voided" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// 6. RUNTIME DISPATCH LISTENER (PORT 5000)
// ==========================================
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server executing perfectly on port ${PORT}`));
