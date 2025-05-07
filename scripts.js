document.addEventListener('DOMContentLoaded', () => {
    // Initialize localStorage
    console.log('Initializing localStorage for propertyData');
    if (!localStorage.getItem('propertyData')) {
        const initialData = {
            Morrison: { financials: [], renter: {}, purchasePrice: 0 },
            Orange: { financials: [], renter: {}, purchasePrice: 0 },
            Osthoff: { financials: [], renter: {}, purchasePrice: 0 },
            Spring: { financials: [], renter: {}, purchasePrice: 0 }
        };
        localStorage.setItem('propertyData', JSON.stringify(initialData));
        console.log('Created new propertyData:', initialData);
    } else {
        console.log('propertyData exists:', JSON.parse(localStorage.getItem('propertyData')));
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
                console.log('Renter info saved for', property, data[property].renter);
                updatePropertyPage(property);
            } catch (error) {
                console.error('Error saving renter info:', error);
                alert('Failed to save renter info.');
            }
        });
    });

    // Handle purchase price form
    document.querySelectorAll('[id^="initialCostForm-"]').forEach(form => {
        const property = form.id.split('-')[1];
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                const data = JSON.parse(localStorage.getItem('propertyData'));
                data[property].purchasePrice = parseFloat(form.querySelector('#purchasePrice').value) || 0;
                localStorage.setItem('propertyData', JSON.stringify(data));
                alert('Purchase price saved!');
                console.log('Purchase price saved for', property, data[property].purchasePrice);
                updatePropertyPage(property);
            } catch (error) {
                console.error('Error saving purchase price:', error);
                alert('Failed to save purchase price.');
            }
        });
    });

    // Handle financial data form
    const dataForm = document.getElementById('dataForm');
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
                if (!data[property].financials) data[property].financials = [];
                data[property].financials.push(entry);
                localStorage.setItem('propertyData', JSON.stringify(data));
                alert('Financial data saved!');
                console.log('Financial data saved for', property, data[property].financials);
                dataForm.reset();
                updatePropertyPage(property);
            } catch (error) {
                console.error('Error saving financial data:', error);
                alert('Failed to save financial data.');
            }
        });
    }

    // Update property page
    function updatePropertyPage(property) {
        const monthlyAccounting = document.getElementById(`monthlyAccounting-${property}`);
        const overallPerformance = document.getElementById(`overallPerformance-${property}`);
        const renterForm = document.getElementById(`renterForm-${property}`);
        const initialCostForm = document.getElementById(`initialCostForm-${property}`);
        
        if (!monthlyAccounting || !overallPerformance || !renterForm || !initialCostForm) {
            console.log('Skipping update for', property, 'due to missing DOM elements');
            return;
        }

        try {
            const data = JSON.parse(localStorage.getItem('propertyData'));
            if (!data || !data[property]) {
                console.error('No data found for', property);
                monthlyAccounting.innerHTML = '<p>No data available.</p>';
                overallPerformance.innerHTML = '<p>No data available.</p>';
                return;
            }

            const financials = data[property].financials || [];
            const renter = data[property].renter || {};
            const purchasePrice = data[property].purchasePrice || 0;

            console.log('Updating property page for', property, { financials, renter, purchasePrice });

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
                const month = entry.date ? entry.date.slice(0, 7) : 'Unknown';
                if (!monthlyData[month]) {
                    monthlyData[month] = { rent: 0, lateFees: 0, expenses: 0, taxes: 0, renovations: 0, profit: 0 };
                }
                monthlyData[month].rent += entry.rent || 0;
                monthlyData[month].lateFees += entry.lateFees || 0;
                monthlyData[month].expenses += entry.expenses || 0;
                monthlyData[month].taxes += entry.taxes || 0;
                monthlyData[month].renovations += entry.renovations || 0;
                monthlyData[month].profit += (entry.rent + entry.lateFees - entry.expenses - entry.taxes - entry.renovations);
            });

            let accountingHTML = '<table class="w-full border-collapse"><thead><tr class="bg-gray-200"><th class="border p-2">Month</th><th class="border p-2">Rent ($)</th><th class="border p-2">Late Fees ($)</th><th class="border p-2">Expenses ($)</th><th class="border p-2">Taxes ($)</th><th class="border p-2">Renovations ($)</th><th class="border p-2">Profit ($)</th></tr></thead><tbody>';
            if (Object.keys(monthlyData).length === 0) {
                accountingHTML += '<tr><td colspan="7" class="border p-2 text-center">No financial data.</td></tr>';
            } else {
                for (const month in monthlyData) {
                    accountingHTML += `<tr><td class="border p-2">${month}</td><td class="border p-2">${monthlyData[month].rent.toFixed(2)}</td><td class="border p-2">${monthlyData[month].lateFees.toFixed(2)}</td><td class="border p-2">${monthlyData[month].expenses.toFixed(2)}</td><td class="border p-2">${monthlyData[month].taxes.toFixed(2)}</td><td class="border p-2">${monthlyData[month].renovations.toFixed(2)}</td><td class="border p-2">${monthlyData[month].profit.toFixed(2)}</td></tr>`;
                }
            }
            accountingHTML += '</tbody></table>';
            monthlyAccounting.innerHTML = accountingHTML;

            // Overall performance
            const totalIncome = financials.reduce((sum, entry) => sum + (entry.rent || 0) + (entry.lateFees || 0), 0);
            const totalExpenses = financials.reduce((sum, entry) => sum + (entry.expenses || 0) + (entry.taxes || 0) + (entry.renovations || 0), 0);
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

    // Update dashboard
    const performanceSummary = document.getElementById('performanceSummary');
    const transactionHistory = document.getElementById('transactionHistory');
    if (performanceSummary && transactionHistory) {
        try {
            const data = JSON.parse(localStorage.getItem('propertyData'));
            if (!data) {
                console.error('No property data found in localStorage');
                performanceSummary.innerHTML = '<p>No data available.</p>';
                transactionHistory.innerHTML = '<p>No data available.</p>';
                return;
            }

            console.log('Updating dashboard with data:', data);

            let summaryHTML = '<table class="w-full border-collapse"><thead><tr class="bg-gray-200"><th class="border p-2">Property</th><th class="border p-2">Total Income</th><th class="border p-2">Total Expenses</th><th class="border p-2">Profit</th><th class="border p-2">ROI (%)</th></tr></thead><tbody>';
            let historyHTML = '';
            let hasData = false;

            for (const property in data) {
                const financials = data[property].financials || [];
                const purchasePrice = data[property].purchasePrice || 0;
                let totalIncome = 0;
                let totalExpenses = 0;

                historyHTML += `<h4 class="text-lg font-semibold mt-4">${property}</h4>`;
                historyHTML += '<table class="w-full border-collapse mb-4"><thead><tr class="bg-gray-200"><th class="border p-2">Date</th><th class="border p-2">Rent ($)</th><th class="border p-2">Late Fees ($)</th><th class="border p-2">Expenses ($)</th><th class="border p-2">Expense Type</th><th class="border p-2">Payment Method</th><th class="border p-2">Taxes ($)</th><th class="border p-2">Renovations ($)</th><th class="border p-2">Rent On Time</th></tr></thead><tbody>';
                
                if (financials.length === 0) {
                    historyHTML += '<tr><td colspan="9" class="border p-2 text-center">No transactions.</td></tr>';
                } else {
                    hasData = true;
                    financials.forEach(entry => {
                        totalIncome += (entry.rent || 0) + (entry.lateFees || 0);
                        totalExpenses += (entry.expenses || 0) + (entry.taxes || 0) + (entry.renovations || 0);
                        historyHTML += `<tr><td class="border p-2">${entry.date || 'Unknown'}</td><td class="border p-2">${(entry.rent || 0).toFixed(2)}</td><td class="border p-2">${(entry.lateFees || 0).toFixed(2)}</td><td class="border p-2">${(entry.expenses || 0).toFixed(2)}</td><td class="border p-2">${entry.expenseType || 'None'}</td><td class="border p-2">${entry.paymentMethod || 'None'}</td><td class="border p-2">${(entry.taxes || 0).toFixed(2)}</td><td class="border p-2">${(entry.renovations || 0).toFixed(2)}</td><td class="border p-2">${entry.rentPaidOnTime || 'Yes'}</td></tr>`;
                    });
                }
                historyHTML += '</tbody></table>';

                const profit = totalIncome - totalExpenses;
                const roi = purchasePrice ? ((profit / purchasePrice) * 100).toFixed(2) : 0;
                summaryHTML += `<tr><td class="border p-2">${property}</td><td class="border p-2">${totalIncome.toFixed(2)}</td><td class="border p-2">${totalExpenses.toFixed(2)}</td><td class="border p-2">${profit.toFixed(2)}</td><td class="border p-2">${roi}</td></tr>`;
            }

            summaryHTML += '</tbody></table>';
            performanceSummary.innerHTML = hasData ? summaryHTML : '<p>No financial data available.</p>';
            transactionHistory.innerHTML = hasData ? historyHTML : '<p>No transactions available.</p>';
        } catch (error) {
            console.error('Error updating dashboard:', error);
            performanceSummary.innerHTML = '<p>Error loading summary.</p>';
            transactionHistory.innerHTML = '<p>Error loading history.</p>';
        }
    }

    // Initialize all property pages
    ['Morrison', 'Orange', 'Osthoff', 'Spring'].forEach(property => {
        try {
            updatePropertyPage(property);
        } catch (error) {
            console.error(`Error initializing property page ${property}:`, error);
        }
    });
});
