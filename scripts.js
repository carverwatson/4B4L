document.addEventListener('DOMContentLoaded', () => {
    const dataForm = document.getElementById('dataForm');
    const performanceSummary = document.getElementById('performanceSummary');
    const transactionHistory = document.getElementById('transactionHistory');
    const deleteProperty = document.getElementById('deleteProperty');
    const entryList = document.getElementById('entryList');
    const deleteButton = document.getElementById('deleteButton');

    // Initialize localStorage
    if (!localStorage.getItem('propertyData')) {
        localStorage.setItem('propertyData', JSON.stringify({
            Morrison: { financials: [], renter: {}, purchasePrice: 0 },
            Orange: { financials: [], renter: {}, purchasePrice: 0 },
            Osthoff: { financials: [], renter: {}, purchasePrice: 0 },
            Spring: { financials: [], renter: {}, purchasePrice: 0 }
        }));
    }

    // Handle renter info form
    document.querySelectorAll('[id^="renterForm-"]').forEach(form => {
        const property = form.id.split('-')[1];
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = JSON.parse(localStorage.getItem('propertyData'));
            data[property].renter = {
                name: form.querySelector('#renterName').value || '',
                email: form.querySelector('#renterEmail').value || '',
                phone: form.querySelector('#renterPhone').value || '',
                numTenants: parseInt(form.querySelector('#numTenants').value) || 0,
                numPets: parseInt(form.querySelector('#numPets').value) || 0,
                moveInDate: form.querySelector('#moveInDate').value || ''
            };
            localStorage.setItem('propertyData', JSON.stringify(data));
            alert('Renter info saved!');
            updatePropertyPage(property);
        });
    });

    // Handle initial cost form
    document.querySelectorAll('[id^="initialCostForm-"]').forEach(form => {
        const property = form.id.split('-')[1];
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = JSON.parse(localStorage.getItem('propertyData'));
            data[property].purchasePrice = parseFloat(form.querySelector('#purchasePrice').value) || 0;
            localStorage.setItem('propertyData', JSON.stringify(data));
            alert('Purchase price saved!');
            updatePropertyPage(property);
        });
    });

    // Handle financial data form
    if (dataForm) {
        dataForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const property = dataForm.querySelector('#property').value;
            const entry = {
                date: dataForm.querySelector('#date').value || '',
                rent: parseFloat(dataForm.querySelector('#rent').value) || 0,
                lateFees: parseFloat(dataForm.querySelector('#lateFees').value) || 0,
                expenses: parseFloat(dataForm.querySelector('#expenses').value) || 0,
                expenseType: dataForm.querySelector('#expenseType').value || '',
                paymentMethod: dataForm.querySelector('#paymentMethod').value || '',
                rentPaidOnTime: dataForm.querySelector('#rentPaidOnTime').value || 'Yes'
            };

            const data = JSON.parse(localStorage.getItem('propertyData'));
            data[property].financials.push(entry);
            localStorage.setItem('propertyData', JSON.stringify(data));
            alert('Financial data saved!');
            dataForm.reset();
            updatePropertyPage(property);
            updateDeleteList(property); // Refresh delete list if property is selected
        });
    }

    // Handle delete functionality
    if (deleteProperty && entryList && deleteButton) {
        deleteProperty.addEventListener('change', () => {
            updateDeleteList(deleteProperty.value);
        });

        deleteButton.addEventListener('click', () => {
            const property = deleteProperty.value;
            if (!property) return;
            const data = JSON.parse(localStorage.getItem('propertyData'));
            const checkboxes = document.querySelectorAll('.entry-checkbox:checked');
            const indices = Array.from(checkboxes).map(cb => parseInt(cb.value)).sort((a, b) => b - a);
            indices.forEach(index => data[property].financials.splice(index, 1));
            localStorage.setItem('propertyData', JSON.stringify(data));
            alert('Selected entries deleted!');
            updateDeleteList(property);
            updatePropertyPage(property);
        });
    }

    // Update delete list
    function updateDeleteList(property) {
        if (!property || !entryList || !deleteButton) return;
        entryList.innerHTML = '';
        deleteButton.disabled = true;
        const data = JSON.parse(localStorage.getItem('propertyData'));
        if (data[property].financials.length === 0) {
            entryList.innerHTML = '<p>No entries to delete.</p>';
            return;
        }
        entryList.innerHTML = data[property].financials.map((entry, index) => `
            <div class="flex items-center space-x-2">
                <input type="checkbox" value="${index}" class="entry-checkbox">
                <span>${entry.date} - Rent: $${entry.rent.toFixed(2)}, Expenses: $${entry.expenses.toFixed(2)} (${entry.expenseType || 'None'})</span>
            </div>
        `).join('');
        document.querySelectorAll('.entry-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                deleteButton.disabled = !document.querySelectorAll('.entry-checkbox:checked').length;
            });
        });
    }

    // Update property page
    function updatePropertyPage(property) {
        const monthlyAccounting = document.getElementById(`monthlyAccounting-${property}`);
        const overallPerformance = document.getElementById(`overallPerformance-${property}`);
        const renterForm = document.getElementById(`renterForm-${property}`);
        const initialCostForm = document.getElementById(`initialCostForm-${property}`);

        if (monthlyAccounting && overallPerformance && renterForm && initialCostForm) {
            const data = JSON.parse(localStorage.getItem('propertyData'))[property];
            const financials = data.financials;
            const renter = data.renter;
            const purchasePrice = data.purchasePrice;

            // Populate renter form
            renterForm.querySelector('#renterName').value = renter.name || '';
            renterForm.querySelector('#renterEmail').value = renter.email || '';
            renterForm.querySelector('#renterPhone').value = renter.phone || '';
            renterForm.querySelector('#numTenants').value = renter.numTenants || '';
            renterForm.querySelector('#numPets').value = renter.numPets || '';
            renterForm.querySelector('#moveInDate').value = renter.moveInDate || '';

            // Populate purchase price
            initialCostForm.querySelector('#purchasePrice').value = purchasePrice || '';

            // Monthly accounting
            const monthlyData = {};
            financials.forEach(entry => {
                const month = entry.date.slice(0, 7); // YYYY-MM
                if (!monthlyData[month]) {
                    monthlyData[month] = { rent: 0, lateFees: 0, expenses: 0, profit: 0 };
                }
                monthlyData[month].rent += entry.rent;
                monthlyData[month].lateFees += entry.lateFees;
                monthlyData[month].expenses += entry.expenses;
                monthlyData[month].profit += (entry.rent + entry.lateFees - entry.expenses);
            });

            let accountingHTML = '<table class="w-full border-collapse"><thead><tr class="bg-gray-200"><th class="border p-2">Month</th><th class="border p-2">Rent ($)</th><th class="border p-2">Late Fees ($)</th><th class="border p-2">Expenses ($)</th><th class="border p-2">Profit ($)</th></tr></thead><tbody>';
            for (const month in monthlyData) {
                accountingHTML += `<tr><td class="border p-2">${month}</td><td class="border p-2">${monthlyData[month].rent.toFixed(2)}</td><td class="border p-2">${monthlyData[month].lateFees.toFixed(2)}</td><td class="border p-2">${monthlyData[month].expenses.toFixed(2)}</td><td class="border p-2">${monthlyData[month].profit.toFixed(2)}</td></tr>`;
            }
            accountingHTML += '</tbody></table>';
            monthlyAccounting.innerHTML = accountingHTML;

            // Overall performance
            const totalIncome = financials.reduce((sum, entry) => sum + entry.rent + entry.lateFees, 0);
            const totalExpenses = financials.reduce((sum, entry) => sum + entry.expenses, 0);
            const totalProfit = totalIncome - totalExpenses;
            const roi = purchasePrice ? ((totalProfit / purchasePrice) * 100).toFixed(2) : 0;
            overallPerformance.innerHTML = `
                <p><strong>Purchase Price:</strong> $${purchasePrice.toFixed(2)}</p>
                <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
                <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
                <p><strong>Total Profit:</strong> $${totalProfit.toFixed(2)}</p>
                <p><strong>Overall ROI:</strong> ${roi}%</p>
            `;
        }
    }

    // Dashboard
    if (performanceSummary && transactionHistory) {
        const data = JSON.parse(localStorage.getItem('propertyData'));
        let summaryHTML = '<h3 class="text-xl font-semibold mb-2">Performance Summary</h3>';
        summaryHTML += '<table class="w-full border-collapse"><thead><tr class="bg-gray-200"><th class="border p-2">Property</th><th class="border p-2">Total Income</th><th class="border p-2">Total Expenses</th><th class="border p-2">Profit</th><th class="border p-2">ROI (%)</th></tr></thead><tbody>';
        
        let historyHTML = '';
        for (const property in data) {
            let totalIncome = 0;
            let totalExpenses = 0;
            const purchasePrice = data[property].purchasePrice;
            historyHTML += `<h4 class="text-lg font-semibold mt-4">${property}</h4>`;
            historyHTML += '<table class="w-full border-collapse mb-4"><thead><tr class="bg-gray-200"><th class="border p-2">Date</th><th class="border p-2">Rent ($)</th><th class="border p-2">Late Fees ($)</th><th class="border p-2">Expenses ($)</th><th class="border p-2">Expense Type</th><th class="border p-2">Payment Method</th><th class="border p-2">Rent On Time</th></tr></thead><tbody>';
            
            data[property].financials.forEach(entry => {
                totalIncome += entry.rent + entry.lateFees;
                totalExpenses += entry.expenses;
                historyHTML += `<tr><td class="border p-2">${entry.date}</td><td class="border p-2">${entry.rent.toFixed(2)}</td><td class="border p-2">${entry.lateFees.toFixed(2)}</td><td class="border p-2">${entry.expenses.toFixed(2)}</td><td class="border p-2">${entry.expenseType || 'None'}</td><td class="border p-2">${entry.paymentMethod || 'None'}</td><td class="border p-2">${entry.rentPaidOnTime}</td></tr>`;
            });

            const profit = totalIncome - totalExpenses;
            const roi = purchasePrice ? ((profit / purchasePrice) * 100).toFixed(2) : 0;
            summaryHTML += `<tr><td class="border p-2">${property}</td><td class="border p-2">${totalIncome.toFixed(2)}</td><td class="border p-2">${totalExpenses.toFixed(2)}</td><td class="border p-2">${profit.toFixed(2)}</td><td class="border p-2">${roi}</td></tr>`;
            historyHTML += '</tbody></table>';
        }

        summaryHTML += '</tbody></table>';
        performanceSummary.innerHTML = summaryHTML;
        transactionHistory.innerHTML = historyHTML;
    }

    // Initialize property pages
    ['Morrison', 'Orange', 'Osthoff', 'Spring'].forEach(updatePropertyPage);
});
