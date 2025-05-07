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
            try {
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
            } catch (error) {
                console.error('Error saving renter info:', error);
                alert('Failed to save renter info. Check console for details.');
            }
        });
    });

    // Handle initial cost form
    document.querySelectorAll('[id^="initialCostForm-"]').forEach(form => {
        const property = form.id.split('-')[1];
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const data = JSON.parse(localStorage.getItem('propertyData'));
                data[property].purchasePrice = parseFloat(form.querySelector('#purchasePrice').value) || 0;
                localStorage.setItem('propertyData', JSON.stringify(data));
                alert('Purchase price saved!');
                updatePropertyPage(property);
            } catch (error) {
                console.error('Error saving purchase price:', error);
                alert('Failed to save purchase price. Check console for details.');
            }
        });
    });

    // Handle financial data form
    if (dataForm) {
        dataForm.addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const property = dataForm.querySelector('#property').value;
                const entry = {
                    date: dataForm.querySelector('#date').value || '',
                    rent: parseFloat(dataForm.querySelector('#rent').value) || 0,
                    lateFees: parseFloat(dataForm.querySelector('#lateFees').value) || 0,
                    expenses: parseFloat(dataForm.querySelector('#expenses').value) || 0,
                    expenseType: dataForm.querySelector('#expenseType').value || '',
                    paymentMethod: dataForm.querySelector('#paymentMethod').value || '',
                    taxes: parseFloat(dataForm.querySelector('#taxes').value) || 0,
                    renovations: parseFloat(dataForm.querySelector('#renovations').value) || 0,
                    rentPaidOnTime: dataForm.querySelector('#rentPaidOnTime').value || 'Yes'
                };
                console.log('Saving financial entry:', entry);

                const data = JSON.parse(localStorage.getItem('propertyData'));
                data[property].financials.push(entry);
                localStorage.setItem('propertyData', JSON.stringify(data));
                alert('Financial data saved!');
                dataForm.reset();
                updatePropertyPage(property);
                if (deleteProperty && deleteProperty.value === property) {
                    updateDeleteList(property);
                }
            } catch (error) {
                console.error('Error saving financial data:', error);
                alert('Failed to save financial data. Check console for details.');
            }
        });
    }

    // Handle delete functionality
    if (deleteProperty && entryList && deleteButton) {
        deleteProperty.addEventListener('change', () => {
            updateDeleteList(deleteProperty.value);
        });

        deleteButton.addEventListener('click', () => {
            try {
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
            } catch (error) {
                console.error('Error deleting entries:', error);
                alert('Failed to delete entries. Check console for details.');
            }
        });
    }

    // Update delete list
    function updateDeleteList(property) {
        if (!property || !entryList || !deleteButton) return;
        try {
            entryList.innerHTML = '';
            deleteButton.disabled = true;
            const data = JSON.parse(localStorage.getItem('propertyData'));
            if (!data[property].financials || data[property].financials.length === 0) {
                entryList.innerHTML = '<p>No entries to delete.</p>';
                return;
            }
            entryList.innerHTML = data[property].financials.map((entry, index) => `
                <div class="flex items-center space-x-2">
                    <input type="checkbox" value="${index}" class="entry-checkbox">
                    <span>${entry.date} - Rent: $${entry.rent.toFixed(2)}, Expenses: $${entry.expenses.toFixed(2)} (${entry.expenseType || 'None'}), Taxes: $${entry.taxes.toFixed(2)}, Renovations: $${entry.renovations.toFixed(2)}</span>
                </div>
            `).join('');
            document.querySelectorAll('.entry-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    deleteButton.disabled = !document.querySelectorAll('.entry-checkbox:checked').length;
                });
            });
        } catch (error) {
            console.error('Error updating delete list:', error);
            entryList.innerHTML = '<p>Error loading entries.</p>';
        }
    }

    // Update property page
    function updatePropertyPage(property) {
        const monthlyAccounting = document.getElementById(`monthlyAccounting-${property}`);
        const overallPerformance = document.getElementById(`overallPerformance-${property}`);
        const renterForm = document.getElementById(`renterForm-${property}`);
        const initialCostForm = document.getElementById(`initialCostForm-${property}`);

        if (monthlyAccounting && overallPerformance && renterForm && initialCostForm) {
            try {
                const data = JSON.parse(localStorage.getItem('propertyData'))[property];
                const financials = data.financials || [];
                const renter = data.renter || {};
                const purchasePrice = data.purchasePrice || 0;

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
                        monthlyData[month] = { rent: 0, lateFees: 0, expenses: 0, taxes: 0, renovations: 0, profit: 0 };
                    }
                    monthlyData[month].rent += entry.rent;
                    monthlyData[month].lateFees += entry.lateFees;
                    monthlyData[month].expenses += entry.expenses;
                    monthlyData[month].taxes += entry.taxes;
                    monthlyData[month].renovations += entry.renovations;
                    monthlyData[month].profit += (entry.rent + entry.lateFees - entry.expenses - entry.taxes - entry.renovations);
                });

                let accountingHTML = '<table class="w-full border-collapse"><thead><tr class="bg-gray-200"><th class="border p-2">Month</th><th class="border p-2">Rent ($)</th><th class="border p-2">Late Fees ($)</th><th class="border p-2">Expenses ($)</th><th class="border p-2">Taxes ($)</th><th class="border p-2">Renovations ($)</th><th class="border p-2">Profit ($)</th></tr></thead><tbody>';
                for (const month in monthlyData) {
                    accountingHTML += `<tr><td class="border p-2">${month}</td><td class="border p-2">${monthlyData[month].rent.toFixed(2)}</td><td class="border p-2">${monthlyData[month].lateFees.toFixed(2)}</td><td class="border p-2">${monthlyData[month].expenses.toFixed(2)}</td><td class="border p-2">${monthlyData[month].taxes.toFixed(2)}</td><td class="border p-2">${monthlyData[month].renovations.toFixed(2)}</td><td class="border p-2">${monthlyData[month].profit.toFixed(2)}</td></tr>`;
                }
                accountingHTML += '</tbody></table>';
                monthlyAccounting.innerHTML = accountingHTML;

                // Overall performance
                const totalIncome = financials.reduce((sum, entry) => sum + entry.rent + entry.lateFees, 0);
                const totalExpenses = financials.reduce((sum, entry) => sum + entry.expenses + entry.taxes + entry.renovations, 0);
                const totalProfit = totalIncome - totalExpenses;
                const roi = purchasePrice ? ((totalProfit / purchasePrice) * 100).toFixed(2) : 0;
                overallPerformance.innerHTML = `
                    <p><strong>Purchase Price:</strong> $${purchasePrice.toFixed(2)}</p>
                    <p><strong>Total Income:</strong> $${totalIncome.toFixed(2)}</p>
                    <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
                    <p><strong>Total Profit:</strong> $${totalProfit.toFixed(2)}</p>
                    <p><strong>Overall ROI:</strong> ${roi}%</p>
                `;
            } catch (error) {
                console.error(`Error updating property page ${property}:`, error);
                monthlyAccounting.innerHTML = '<p>Error loading financial data.</p>';
                overallPerformance.innerHTML = '<p>Error loading performance data.</p>';
            }
        }
    }

    // Dashboard
    if (performanceSummary && transactionHistory) {
        try {
            const data = JSON.parse(localStorage.getItem('propertyData'));
            let summaryHTML = '<h3 class="text-xl font-semibold mb-2">Performance Summary</h3>';
            summaryHTML += '<table class="w-full border-collapse"><thead><tr class="bg-gray-200"><th class="border p-2">Property</th><th class="border p-2">Total Income</th><th class="border p-2">Total Expenses</th><th class="border p-2">Profit</th><th class="border p-2">ROI (%)</th></tr></thead><tbody>';
            
            let historyHTML = '';
            for (const property in data) {
                let totalIncome = 0;
                let totalExpenses = 0;
                const purchasePrice = data[property].purchasePrice || 0;
                historyHTML += `<h4 class="text-lg font-semibold mt-4">${property}</h4>`;
                historyHTML += '<table class="w-full border-collapse mb-4"><thead><tr class="bg-gray-200"><th class="border p-2">Date</th><th class="border p-2">Rent ($)</th><th class="border p-2">Late Fees ($)</th><th class="border p-2">Expenses ($)</th><th class="border p-2">Expense Type</th><th class="border p-2">Payment Method</th><th class="border p-2">Taxes ($)</th><th class="border p-2">Renovations ($)</th><th class="border p-2">Rent On Time</th></tr></thead><tbody>';
                
                (data[property].financials || []).forEach(entry => {
                    totalIncome += entry.rent + entry.lateFees;
                    totalExpenses += entry.expenses + entry.taxes + entry.renovations;
                    historyHTML += `<tr><td class="border p-2">${entry.date}</td><td class="border p-2">${entry.rent.toFixed(2)}</td><td class="border p-2">${entry.lateFees.toFixed(2)}</td><td class="border p-2">${entry.expenses.toFixed(2)}</td><td class="border p-2">${entry.expenseType || 'None'}</td><td class="border p-2">${entry.paymentMethod || 'None'}</td><td class="border p-2">${entry.taxes.toFixed(2)}</td><td class="border p-2">${entry.renovations.toFixed(2)}</td><td class="border p-2">${entry.rentPaidOnTime}</td></tr>`;
                });

                const profit = totalIncome - totalExpenses;
                const roi = purchasePrice ? ((profit / purchasePrice) * 100).toFixed(2) : 0;
                summaryHTML += `<tr><td class="border p-2">${property}</td><td class="border p-2">${totalIncome.toFixed(2)}</td><td class="border p-2">${totalExpenses.toFixed(2)}</td><td class="border p-2">${profit.toFixed(2)}</td><td class="border p-2">${roi}</td></tr>`;
                historyHTML += '</tbody></table>';
            }

            summaryHTML += '</tbody></table>';
            performance
