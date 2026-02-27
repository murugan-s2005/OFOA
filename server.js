const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'src', 'data', 'orders.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.join(__dirname, 'src', 'data'), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Helper to read orders
const readOrders = () => {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
};

// Helper to write orders
const writeOrders = (orders) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
};

// API Endpoint: Get all orders (for Admin Dashboard)
app.get('/api/orders', (req, res) => {
    try {
        const orders = readOrders();
        res.json(orders);
    } catch (error) {
        console.error('Error reading orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// API Endpoint: Create a new order (for Checkout)
app.post('/api/orders', (req, res) => {
    try {
        const { customer, items, total } = req.body;

        if (!customer || !items || items.length === 0 || !total) {
            return res.status(400).json({ error: 'Invalid order data' });
        }

        const newOrder = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            customer,
            items,
            total,
            status: 'Pending'
        };

        const orders = readOrders();
        orders.push(newOrder);
        writeOrders(orders);

        res.status(201).json({ message: 'Order placed successfully', orderId: newOrder.id });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// API Endpoint: Update an order status (for Admin Dashboard)
app.put('/api/orders/:id', (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const orders = readOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Just update status
        orders[orderIndex].status = status;
        writeOrders(orders);
        return res.json({ message: 'Order status updated successfully', order: orders[orderIndex] });

    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// API Endpoint: Delete an order (for Admin Dashboard)
app.delete('/api/orders/:id', (req, res) => {
    try {
        const orderId = req.params.id;
        const orders = readOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Remove the order completely
        const removedOrder = orders.splice(orderIndex, 1)[0];
        writeOrders(orders);

        res.json({ message: 'Order removed successfully', order: removedOrder });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
});

// Fallback to index.html for unknown routes (SPA behavior if needed, or just home)
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
