document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});

async function fetchOrders() {
    const tbody = document.getElementById('orders-tbody');
    const loadingMsg = document.getElementById('loading-msg');

    // Stats elements
    const totalOrdersEl = document.getElementById('total-orders');
    const totalRevenueEl = document.getElementById('total-revenue');
    const pendingOrdersEl = document.getElementById('pending-orders');

    loadingMsg.style.display = 'block';
    tbody.innerHTML = '';

    try {
        const response = await fetch('/api/orders');
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        const orders = await response.json();

        loadingMsg.style.display = 'none';

        if (orders.length === 0) {
            loadingMsg.innerText = 'No orders received yet.';
            loadingMsg.style.display = 'block';
            return;
        }

        // Calculate Stats
        totalOrdersEl.innerText = orders.length;

        const revenue = orders.reduce((sum, order) => sum + order.total, 0);
        totalRevenueEl.innerText = '₹' + revenue.toFixed(2);

        const pendingCount = orders.filter(o => o.status === 'Pending').length;
        pendingOrdersEl.innerText = pendingCount;

        // Render Table (Reverse order to show newest first)
        const sortedOrders = [...orders].reverse();

        // Filter out completed orders from the visible list
        const pendingOrdersOnly = sortedOrders.filter(o => o.status === 'Pending');

        pendingOrdersOnly.forEach(order => {
            const tr = document.createElement('tr');

            const dateObj = new Date(order.date);
            const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Format Items list
            let itemsHtml = '<ul class="order-items-list">';
            order.items.forEach(item => {
                itemsHtml += `<li>${item.quantity}x ${item.name}</li>`;
            });
            itemsHtml += '</ul>';

            tr.innerHTML = `
                <td><strong>#${order.id.slice(-6)}</strong></td>
                <td>${formattedDate}</td>
                <td>
                    <strong>${order.customer.name}</strong><br>
                    <small>${order.customer.email}</small><br>
                    <small>${order.customer.address}</small><br>
                    <small><i>Pay: ${order.customer.payment.toUpperCase()}</i></small>
                </td>
                <td>${itemsHtml}</td>
                <td><strong>₹${order.total.toFixed(2)}</strong></td>
                <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                <td style="display: flex; gap: 8px;">
                    <button type="button" class="btn btn-primary" style="padding: 5px 12px; font-size: 0.85rem;" onclick="markOrderCompleted('${order.id}')">Proceed</button>
                    <button type="button" class="btn" style="padding: 5px 12px; font-size: 0.85rem; background: #ff4757; color: white; border: none;" onclick="removeOrder('${order.id}')">Remove</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error:', error);
        loadingMsg.innerText = 'Error loading orders. Please try again.';
        loadingMsg.style.color = 'red';
    }
}

async function markOrderCompleted(orderId) {
    if (!confirm('Are you sure you want to mark this order as completed?')) return;

    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Completed' })
        });

        if (!response.ok) throw new Error('Failed to update order status');

        // Refetch orders to update the UI
        fetchOrders();

    } catch (error) {
        console.error('Error updating order:', error);
        alert('Failed to update order status. Please try again.');
    }
}

async function removeOrder(orderId) {
    if (!confirm('Are you sure you want to completely remove this order?')) return;

    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete order');

        // Refetch orders to update the UI
        fetchOrders();

    } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order. Please try again.');
    }
}
