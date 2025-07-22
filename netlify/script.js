document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const chartCanvas = document.getElementById('dValueChart');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyFilterButton = document.getElementById('applyFilter');
    let chartInstance = null;

    const API_ENDPOINT = '/api/get-d-values';

    // Set today's date (default value)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month starts from 0, so +1
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    startDateInput.value = formatDate(sevenDaysAgo);
    endDateInput.value = formatDate(today);

    async function fetchDValueData() {
        statusDiv.textContent = 'Loading data...';
        try {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;

            // Add date parameters to API endpoint
            const url = `${API_ENDPOINT}?startDate=${startDate}&endDate=${endDate}`;

            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            const data = await response.json();

            if (!data || !Array.isArray(data) || data.length === 0) {
                statusDiv.textContent = 'No data available for the selected period.';
                if (chartInstance) {
                    chartInstance.destroy();
                    chartInstance = null;
                }
                return;
            }

            // Convert timestamps to Date objects for x-axis
            // Handle various timestamp formats including "2025-07-20T11:45:04+00:00Z"
            const timestamps = data.map((item) => {
                let timestamp = item.timestamp;

                // Handle the unusual format with both timezone offset and Z
                if (timestamp.includes('+') && timestamp.endsWith('Z')) {
                    // Remove the trailing 'Z' when there's already a timezone offset
                    timestamp = timestamp.slice(0, -1);
                } else if (timestamp.includes('+') || timestamp.includes('-')) {
                    // If it has timezone offset but no Z, use as is
                    timestamp = timestamp;
                } else if (!timestamp.endsWith('Z')) {
                    // If no timezone info, assume UTC
                    timestamp = timestamp + 'Z';
                }

                const date = new Date(timestamp);

                // Check if date is valid
                if (isNaN(date.getTime())) {
                    console.error('Invalid timestamp:', item.timestamp);
                    return new Date(); // Return current date as fallback
                }

                return date;
            });
            const dValues = data.map((item) => item.d_value);

            // Log for debugging
            console.log('Parsed timestamps:', timestamps);
            console.log('D values:', dValues);

            // Set y-axis max to the smaller of (max D value + margin) or 1.0
            let maxDValue = Math.max(...dValues);
            let yAxisMax = Math.min(1.0, Math.ceil((maxDValue + 0.05) * 100) / 100);
            // If all data is zero, set a minimum y-axis max
            if (!isFinite(yAxisMax) || yAxisMax <= 0) {
                yAxisMax = 0.1;
            }

            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }

            // Determine the appropriate time unit based on the number of data points
            let timeUnit = 'day'; // Default unit
            if (timestamps.length <= 20) {
                timeUnit = 'hour';
            } else if (timestamps.length > 100) {
                timeUnit = 'week';
            }

            // Update the time scale configuration
            const timeScaleOptions = {
                unit: timeUnit,
                displayFormats: {
                    hour: 'yyyy/MM/dd HH:mm',
                    day: 'yyyy/MM/dd', // Corrected for day unit
                    week: 'yyyy/MM/dd',
                    month: 'yyyy/MM',
                },
                tooltipFormat: 'yyyy/MM/dd HH:mm:ss',
            };

            chartInstance = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: timestamps,
                    datasets: [
                        {
                            label: 'Randomness Bias (D value)',
                            data: dValues,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1,
                            fill: false,
                            pointRadius: 4, // Make points visible
                            pointHoverRadius: 6, // Larger hover area
                            pointBackgroundColor: 'rgb(75, 192, 192)',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHitRadius: 10, // Increase clickable/hoverable area
                        },
                    ],
                },
                options: {
                    responsive: true, // Enable responsiveness
                    maintainAspectRatio: true, // Maintain aspect ratio
                    interaction: {
                        mode: 'nearest', // Reverted to nearest for better time series interaction
                        axis: 'x',
                        intersect: false,
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: timeScaleOptions, // Use the dynamically determined options
                            title: {
                                display: true,
                                text: 'Measurement DateTime',
                            },
                            ticks: {
                                source: 'auto', // Let Chart.js auto-skip ticks
                                maxRotation: 45,
                                minRotation: 45,
                                // Removed custom callback, relying on Chart.js formatting based on unit
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'D value',
                            },
                            beginAtZero: true,
                            min: 0,
                            max: yAxisMax,
                        },
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                title: function (tooltipItems) {
                                    // Format timestamp for tooltip title
                                    const date = new Date(tooltipItems[0].parsed.x);
                                    const year = date.getFullYear();
                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                    const day = String(date.getDate()).padStart(2, '0');
                                    const hours = String(date.getHours()).padStart(2, '0');
                                    const minutes = String(date.getMinutes()).padStart(2, '0');
                                    const seconds = String(date.getSeconds()).padStart(2, '0');
                                    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
                                },
                                label: function (context) {
                                    return `D value: ${context.parsed.y.toFixed(4)}`;
                                },
                            },
                        },
                    },
                },
            });
            statusDiv.textContent = 'Chart displayed.';
        } catch (error) {
            console.error('Error occurred while fetching D value data:', error);
            statusDiv.textContent = `Failed to load data: ${error.message}`;
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }
        }
    }

    // Fetch data on page load and when filter button is clicked
    applyFilterButton.addEventListener('click', fetchDValueData);
    fetchDValueData(); // Also fetch data on initial load
});
