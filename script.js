document.addEventListener('DOMContentLoaded', () => {
    // Get references to elements
    const showExercisesBtn = document.getElementById('show-exercises');
    const showNutritionBtn = document.getElementById('show-nutrition');
    const exerciseSection = document.getElementById('exercise-section');
    const nutritionSection = document.getElementById('nutrition-section');

    // Function to switch sections
    function switchSection(sectionToShow, buttonToActivate) {
        // Hide all sections
        const allSections = document.querySelectorAll('.app-section');
        allSections.forEach(section => {
            section.classList.remove('active');
            section.classList.add('hidden');
        });

        // Deactivate all nav buttons
        const allNavButtons = document.querySelectorAll('nav button');
        allNavButtons.forEach(button => {
            button.classList.remove('active-nav-btn');
        });

        // Show the selected section.
        sectionToShow.classList.remove('hidden');
        sectionToShow.classList.add('active');

        // Activate the clicked button
        buttonToActivate.classList.add('active-nav-btn');
    }

    // Event listeners for navigation buttons
    showExercisesBtn.addEventListener('click', () => {
        switchSection(exerciseSection, showExercisesBtn);
    });
    showNutritionBtn.addEventListener('click', () => {
        switchSection(nutritionSection, showNutritionBtn);
    });

    // Initialize: Set the "Exercises" section as active on page load
    switchSection(exerciseSection, showExercisesBtn);

    // --- Exercise API Integration ---
    const EXERCISE_API_KEY = 'ae4f0c2c14mshb346e9fc07392c4p11e8a8jsn69366210c814';
    const EXERCISE_API_HOST = 'exercisedb.p.rapidapi.com';

    // Get DOM Elements for Exercise Section
    const exerciseSearchInput = document.getElementById('exercise-search');
    const exerciseMuscleFilter = document.getElementById('exercise-muscle-filter');
    const exerciseTypeFilter = document.getElementById('exercise-type-filter');
    const searchExerciseBtn = document.getElementById('search-exercise-btn');
    const exerciseResultsContainer = document.getElementById('exercise-results');

    // Function to Fetch Exercises
    async function fetchExercises(searchQuery = '', muscle = '', type = '') {
        exerciseResultsContainer.innerHTML = '<p>Loading exercises...</p>';

        let url = 'https://exercisedb.p.rapidapi.com/exercises';
        const params = new URLSearchParams();

        if (searchQuery) {
            params.append('name', searchQuery);
        }
        if (muscle) {
            params.append('muscle', muscle);
        }
        if (type) {
            params.append('type', type);
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': EXERCISE_API_KEY,
                    'X-RapidAPI-Host': EXERCISE_API_HOST
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status} - ${errorData.message || response.statusText}`);
            }

            const data = await response.json();

            if (data.length === 0) {
                exerciseResultsContainer.innerHTML = '<p>No exercises found matching your criteria.</p>';
            } else {
                displayExercises(data);
            }

        } catch (error) {
            console.error('Error fetching exercises:', error);
            exerciseResultsContainer.innerHTML = `<p>Failed to load exercises. Error: ${error.message}. Please check your API key and try again.</p>`;
        }
    }

    // Function to Display Exercises
    function displayExercises(exercises) {
        exerciseResultsContainer.innerHTML = '';

        exercises.forEach(exercise => {
            const exerciseCard = document.createElement('div');
            exerciseCard.classList.add('exercise-card');

            const name = exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1);
            exerciseCard.innerHTML = `
                <h3>${name}</h3>
                <p><strong>Target Muscle:</strong> ${exercise.target.charAt(0).toUpperCase() + exercise.target.slice(1)}</p>
                <p><strong>Equipment:</strong> ${exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1)}</p>
                <img src="${exercise.gifUrl}" alt="${exercise.name}" class="exercise-gif">
                <button class="view-details-btn" data-exercise-id="${exercise.id}">View Details</button>
            `;
            exerciseResultsContainer.appendChild(exerciseCard);
        });

        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const exerciseId = event.target.dataset.exerciseId;
                const selectedExercise = exercises.find(ex => ex.id === exerciseId);
                if (selectedExercise) {
                    showExerciseDetails(selectedExercise);
                }
            });
        });
    }

    // Function to Show Exercise Details in a Modal
    function showExerciseDetails(exercise) {
        const detailsContent = `
            <h3>${exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1)}</h3>
            <p><strong>Body Part:</strong> ${exercise.bodyPart.charAt(0).toUpperCase() + exercise.bodyPart.slice(1)}</p>
            <p><strong>Target Muscle:</strong> ${exercise.target.charAt(0).toUpperCase() + exercise.target.slice(1)}</p>
            <p><strong>Equipment:</strong> ${exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1)}</p>
            <p><strong>Instructions:</strong></p>
            <ol>
                ${exercise.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
            <img src="${exercise.gifUrl}" alt="${exercise.name}" class="exercise-detail-gif">
            <button class="close-modal-btn">Close</button>
        `;

        let modalOverlay = document.getElementById('exercise-detail-modal-overlay');
        if (!modalOverlay) {
            modalOverlay = document.createElement('div');
            modalOverlay.id = 'exercise-detail-modal-overlay';
            modalOverlay.classList.add('modal-overlay', 'hidden');
            modalOverlay.innerHTML = `
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <div id="modal-body-content"></div>
                </div>
            `;
            document.body.appendChild(modalOverlay);

            modalOverlay.querySelector('.close-button').addEventListener('click', () => {
                modalOverlay.classList.add('hidden');
            });
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.classList.add('hidden');
                }
            });
        }
        modalOverlay.querySelector('#modal-body-content').innerHTML = detailsContent;
        modalOverlay.querySelector('.close-modal-btn').addEventListener('click', () => {
            modalOverlay.classList.add('hidden');
        });
        modalOverlay.classList.remove('hidden');
    }

    // Event Listener for Search Button
    searchExerciseBtn.addEventListener('click', () => {
        const query = exerciseSearchInput.value;
        const muscle = exerciseMuscleFilter.value;
        const type = exerciseTypeFilter.value;
        fetchExercises(query, muscle, type);
    });

    // Optionally, fetchExercises(); on page load if you want default exercises
});