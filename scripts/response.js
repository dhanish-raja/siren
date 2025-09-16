document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the JSON string from session storage
    const responseDataString = sessionStorage.getItem('sirenResponse');

    if (responseDataString) {
        // Parse the JSON string back into an object
        const data = JSON.parse(responseDataString);

        // Function to safely update text content
        const updateText = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value || 'N/A'; // Display 'N/A' if value is empty
            }
        };

        // Populate the page with the data
        updateText('department', data.department);
        updateText('priority', data.priority);
        updateText('location', data.location);
        updateText('name', data.name);
        updateText('time', data.time);
        updateText('summary', data.summary);

        // Optional: Clear the data from storage so it's not shown again on a refresh
        sessionStorage.removeItem('sirenResponse');
    } else {
        // Handle cases where the user navigates here directly
        document.querySelector('.report-card').innerHTML = '<h2>No report data found. Please record a new report.</h2>';
    }
});