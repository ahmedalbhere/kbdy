document.addEventListener('DOMContentLoaded', function() {
    // عناصر القائمة الافتراضية
    let menuItems = [
        { id: 1, name: 'كبدة حواشي', price: 40 },
        { id: 2, name: 'كبدة بلدي', price: 35 },
        { id: 3, name: 'فراخ مشوية', price: 60 },
        { id: 4, name: 'كفتة', price: 50 },
        { id: 5, name: 'كباب', price: 55 }
    ];

    // الفاتورة الحالية
    let currentOrder = [];
    let orderId = 1;
    let ordersHistory = [];

    // عناصر DOM
    const menuItemsContainer = document.querySelector('.menu-items');
    const invoiceItemsContainer = document.querySelector('.invoice-items');
    const totalAmountElement = document.getElementById('total-amount');
    const menuListContainer = document.querySelector('.menu-list');
    const newItemNameInput = document.getElementById('new-item-name');
    const newItemPriceInput = document.getElementById('new-item-price');
    const addItemBtn = document.getElementById('add-item-btn');
    const printBtn = document.getElementById('print-btn');
    const newOrderBtn = document.getElementById('new-order-btn');
    const reportTypeSelect = document.getElementById('report-type');
    const reportDateInput = document.getElementById('report-date');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const reportResultsContainer = document.querySelector('.report-results');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // تعيين تاريخ اليوم كتاريخ افتراضي للتقرير
    reportDateInput.valueAsDate = new Date();

    // تحميل البيانات من localStorage إذا وجدت
    loadData();

    // عرض عناصر القائمة
    renderMenuItems();
    renderMenuList();

    // إدارة التبويبات
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // تبديل التبويبات
    function switchTab(tabId) {
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            }
        });

        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    }

    // عرض عناصر القائمة في واجهة الطلب
    function renderMenuItems() {
        menuItemsContainer.innerHTML = '';
        menuItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item';
            itemElement.innerHTML = `
                <h3>${item.name}</h3>
                <p>${item.price} جنيه</p>
            `;
            
            // إضافة حدث النقر لإضافة العنصر للفاتورة
            itemElement.addEventListener('click', () => {
                addToInvoice(item);
            });
            
            // إضافة حدث النقر المزدوج لإضافة العنصر مرتين
            itemElement.addEventListener('dblclick', () => {
                addToInvoice(item);
                addToInvoice(item);
            });
            
            menuItemsContainer.appendChild(itemElement);
        });
    }

    // إضافة عنصر للفاتورة
    function addToInvoice(item) {
        const existingItem = currentOrder.find(orderItem => orderItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            currentOrder.push({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }
        
        renderInvoice();
    }

    // عرض الفاتورة
    function renderInvoice() {
        invoiceItemsContainer.innerHTML = '';
        let total = 0;
        
        currentOrder.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'invoice-item';
            itemElement.innerHTML = `
                <span>${item.name} (${item.quantity})</span>
                <span>${itemTotal} جنيه</span>
            `;
            
            invoiceItemsContainer.appendChild(itemElement);
        });
        
        totalAmountElement.textContent = total.toFixed(2);
    }

    // عرض قائمة الإدارة
    function renderMenuList() {
        menuListContainer.innerHTML = '';
        menuItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-list-item';
            itemElement.innerHTML = `
                <span>${item.name}</span>
                <div>
                    <input type="number" value="${item.price}" data-id="${item.id}" class="price-input">
                    <button class="delete-btn" data-id="${item.id}">حذف</button>
                </div>
            `;
            
            menuListContainer.appendChild(itemElement);
        });
        
        // إضافة أحداث لتعديل الأسعار
        document.querySelectorAll('.price-input').forEach(input => {
            input.addEventListener('change', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const newPrice = parseFloat(this.value);
                updateItemPrice(id, newPrice);
            });
        });
        
        // إضافة أحداث لحذف الأصناف
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteMenuItem(id);
            });
        });
    }

    // تعديل سعر الصنف
    function updateItemPrice(id, newPrice) {
        const item = menuItems.find(item => item.id === id);
        if (item) {
            item.price = newPrice;
            saveData();
            renderMenuItems();
        }
    }

    // حذف صنف من القائمة
    function deleteMenuItem(id) {
        menuItems = menuItems.filter(item => item.id !== id);
        saveData();
        renderMenuList();
        renderMenuItems();
    }

    // إضافة صنف جديد
    addItemBtn.addEventListener('click', function() {
        const name = newItemNameInput.value.trim();
        const price = parseFloat(newItemPriceInput.value);
        
        if (name && !isNaN(price) && price > 0) {
            const newId = menuItems.length > 0 ? Math.max(...menuItems.map(item => item.id)) + 1 : 1;
            menuItems.push({
                id: newId,
                name: name,
                price: price
            });
            
            saveData();
            renderMenuList();
            renderMenuItems();
            
            newItemNameInput.value = '';
            newItemPriceInput.value = '';
        } else {
            alert('الرجاء إدخال اسم وسعر صحيحين');
        }
    });

    // طباعة الفاتورة
    printBtn.addEventListener('click', function() {
        if (currentOrder.length === 0) {
            alert('لا توجد عناصر في الفاتورة');
            return;
        }
        
        // حفظ الطلب في السجل
        const order = {
            id: orderId++,
            items: [...currentOrder],
            total: parseFloat(totalAmountElement.textContent),
            date: new Date()
        };
        
        ordersHistory.push(order);
        saveData();
        
        // طباعة الفاتورة
        const invoiceContent = generateInvoiceContent(order);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(invoiceContent);
        printWindow.document.close();
        printWindow.print();
    });

    // إنشاء محتوى الفاتورة للطباعة
    function generateInvoiceContent(order) {
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
            `;
        });
        
        return `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فاتورة طلب</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { text-align: center; color: #8B0000; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    th { background-color: #8B0000; color: white; }
                    .total { font-weight: bold; font-size: 18px; text-align: left; margin-top: 10px; }
                    .date { text-align: left; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <h1>فاتورة طلب</h1>
                <p class="date">التاريخ: ${order.date.toLocaleString()}</p>
                <p>رقم الفاتورة: ${order.id}</p>
                <table>
                    <thead>
                        <tr>
                            <th>الصنف</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <p class="total">الإجمالي: ${order.total.toFixed(2)} جنيه</p>
            </body>
            </html>
        `;
    }

    // طلب جديد
    newOrderBtn.addEventListener('click', function() {
        if (currentOrder.length === 0) return;
        
        if (confirm('هل تريد بدء طلب جديد؟ سيتم مسح الفاتورة الحالية.')) {
            currentOrder = [];
            renderInvoice();
        }
    });

    // إنشاء التقارير
    generateReportBtn.addEventListener('click', function() {
        const reportType = reportTypeSelect.value;
        const reportDate = new Date(reportDateInput.value);
        
        let filteredOrders = [];
        let reportTitle = '';
        
        if (reportType === 'daily') {
            filteredOrders = ordersHistory.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate.toDateString() === reportDate.toDateString();
            });
            reportTitle = `تقرير يومي - ${reportDate.toLocaleDateString()}`;
        } else if (reportType === 'weekly') {
            const startOfWeek = new Date(reportDate);
            startOfWeek.setDate(reportDate.getDate() - reportDate.getDay());
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            filteredOrders = ordersHistory.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= startOfWeek && orderDate <= endOfWeek;
            });
            reportTitle = `تقرير أسبوعي - من ${startOfWeek.toLocaleDateString()} إلى ${endOfWeek.toLocaleDateString()}`;
        } else if (reportType === 'monthly') {
            const startOfMonth = new Date(reportDate.getFullYear(), reportDate.getMonth(), 1);
            const endOfMonth = new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0);
            
            filteredOrders = ordersHistory.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= startOfMonth && orderDate <= endOfMonth;
            });
            reportTitle = `تقرير شهري - ${reportDate.toLocaleDateString('ar', { month: 'long', year: 'numeric' })}`;
        }
        
        displayReport(filteredOrders, reportTitle);
    });

    // عرض التقرير
    function displayReport(orders, title) {
        if (orders.length === 0) {
            reportResultsContainer.innerHTML = `<p>لا توجد بيانات للعرض</p>`;
            return;
        }
        
        // حساب الإجماليات
        const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
        const totalItems = orders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
        
        // تحضير جدول الأصناف الأكثر مبيعًا
        const popularItems = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (popularItems[item.name]) {
                    popularItems[item.name] += item.quantity;
                } else {
                    popularItems[item.name] = item.quantity;
                }
            });
        });
        
        const popularItemsSorted = Object.entries(popularItems)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        let popularItemsHtml = '';
        popularItemsSorted.forEach(([name, quantity], index) => {
            popularItemsHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${name}</td>
                    <td>${quantity}</td>
                </tr>
            `;
        });
        
        reportResultsContainer.innerHTML = `
            <h3>${title}</h3>
            <div class="report-summary">
                <p>عدد الفواتير: ${orders.length}</p>
                <p>إجمالي المبيعات: ${totalSales.toFixed(2)} جنيه</p>
                <p>عدد الأصناف المباعة: ${totalItems}</p>
            </div>
            
            <h4>أكثر الأصناف مبيعًا</h4>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>الصنف</th>
                        <th>الكمية</th>
                    </tr>
                </thead>
                <tbody>
                    ${popularItemsHtml}
                </tbody>
            </table>
            
            <h4>تفاصيل الفواتير</h4>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>رقم الفاتورة</th>
                        <th>التاريخ</th>
                        <th>عدد الأصناف</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>${order.id}</td>
                            <td>${new Date(order.date).toLocaleString()}</td>
                            <td>${order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                            <td>${order.total.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // حفظ البيانات في localStorage
    function saveData() {
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
        localStorage.setItem('ordersHistory', JSON.stringify(ordersHistory));
        localStorage.setItem('orderId', orderId.toString());
    }

    // تحميل البيانات من localStorage
    function loadData() {
        const savedMenuItems = localStorage.getItem('menuItems');
        const savedOrdersHistory = localStorage.getItem('ordersHistory');
        const savedOrderId = localStorage.getItem('orderId');
        
        if (savedMenuItems) {
            menuItems = JSON.parse(savedMenuItems);
        }
        
        if (savedOrdersHistory) {
            ordersHistory = JSON.parse(savedOrdersHistory);
        }
        
        if (savedOrderId) {
            orderId = parseInt(savedOrderId);
        }
    }
});
