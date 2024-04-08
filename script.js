// Function to display users in the HTML
function displayUsers(users) {
    const container = document.getElementById('users');
    container.innerHTML = ''; // Clear existing content

    users.forEach(user => {
        const userDiv = document.createElement('div');
        const userDetailsDiv = document.createElement('div');
        userDiv.classList.add('user-summary');
        userDetailsDiv.classList.add('user-details');
        userDetailsDiv.style.display = 'none'; // Hide details initially

        // Calculate hit rates for ML and LLM
        const mlHits = user.predictions.reduce((count, item) => {
            const lowerBound = Math.floor(item.predicted_rating);
            const upperBound = Math.ceil(item.predicted_rating);
            return count + (lowerBound === item.rating || upperBound === item.rating ? 1 : 0);
        }, 0);
        const mlHitRate = ((mlHits / user.predictions.length) * 100).toFixed(2);

        const llmHits = user.predictions.reduce((count, item) => {
            const bounds = item.llm_prediction.split('-').map(Number);
            return count + (bounds.includes(item.rating) ? 1 : 0);
        }, 0);
        const llmHitRate = ((llmHits / user.predictions.length) * 100).toFixed(2);

        // Display user ID and hit rates
        userDiv.innerHTML = `<h3>User ID: ${user.user_id} (ML Hit Rate: ${mlHitRate}%, LLM Hit Rate: ${llmHitRate}%)</h3>`;

        // History Section
        const historySummary = document.createElement('div');
        historySummary.classList.add('history-summary');
        historySummary.innerHTML = `<strong>History (${user.history.length})</strong>`;
        const historyDetails = document.createElement('div');
        historyDetails.classList.add('history-details');
        historyDetails.style.display = 'none'; // Hide history details initially

        const historyList = document.createElement('ul');
        user.history.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.movie_name} (${item.rating})`;
            historyList.appendChild(listItem);
        });
        historyDetails.appendChild(historyList);

        // Toggle function for history
        historySummary.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent the user detail toggle when clicking history
            historyDetails.style.display = historyDetails.style.display === 'none' ? 'block' : 'none';
        });

        // Predictions Table setup
        const predictionsTable = document.createElement('table');
        predictionsTable.innerHTML = `
            <tr>
                <th>Movie</th>
                <th>Actual Rating</th>
                <th>ML Rating</th>
                <th>LLM Rating</th>
            </tr>
        `;

        // Populate Predictions Table with hit visual cues
        user.predictions.forEach(item => {
            const row = document.createElement('tr');
            const mlLowerBound = Math.floor(item.predicted_rating);
            const mlUpperBound = Math.ceil(item.predicted_rating);
            const mlHit = mlLowerBound === item.rating || mlUpperBound === item.rating;

            const bounds = item.llm_prediction.split('-').map(Number);
            const llmHit = bounds.includes(item.rating);

            row.innerHTML = `
                <td>${item.movie_name}</td>
                <td class="centered">${item.rating}</td>
                <td class="${mlHit ? 'hit' : ''}">${item.predicted_rating.toFixed(2)}</td>
                <td class="${llmHit ? 'hit' : ''}">${item.llm_prediction}</td>
            `;
            predictionsTable.appendChild(row);
        });

        // Append history and predictions to user details div
        userDetailsDiv.appendChild(historySummary);
        userDetailsDiv.appendChild(historyDetails);
        userDetailsDiv.appendChild(predictionsTable);

        // Toggle visibility of user details
        userDiv.addEventListener('click', function() {
            userDetailsDiv.style.display = userDetailsDiv.style.display === 'none' ? 'block' : 'none';
        });

        // Append user summary and details to the container
        container.appendChild(userDiv);
        container.appendChild(userDetailsDiv);
    });
}

// Function to sort by history size
function sortByHistory() {
    loadAndSortData((a, b) => b.history.length - a.history.length);
}

// Function to sort by predictions size
function sortByPredictions() {
    loadAndSortData((a, b) => b.predictions.length - a.predictions.length);
}

// Load and sort data
function loadAndSortData(sortFunction) {
    fetch('predict_data.json')
    .then(response => response.json())
    .then(data => {
        const sortedData = data.sort(sortFunction);
        displayUsers(sortedData);
    })
    .catch(error => console.error('Error loading the JSON data:', error));
}

// Initial load
loadAndSortData(() => 0); // No sorting, just load
