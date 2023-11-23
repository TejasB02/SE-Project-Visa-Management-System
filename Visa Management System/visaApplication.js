document.addEventListener('DOMContentLoaded', function () {
    const formSelector = document.getElementById('formSelector');
    const createForm = document.getElementById('createForm');
    const readForm = document.getElementById('readForm');
    const searchButton = document.getElementById('searchButton');
    const visaApplicationForm = document.getElementById('createForm'); // Corrected element ID

    // Set default form to create
    createForm.style.display = 'block';
    readForm.style.display = 'none';

    // Event listener for form selector change
    formSelector.addEventListener('change', function () {
        const selectedOption = formSelector.value;

        // Toggle form visibility based on the selected option
        if (selectedOption === 'create') {
            createForm.style.display = 'block';
            readForm.style.display = 'none';
        } else if (selectedOption === 'read') {
            createForm.style.display = 'none';
            readForm.style.display = 'block';
        }
    });
    
    // Get the consulate dropdown and consular officer dropdown
    const consulateDropdown = document.getElementById('consulate_name');
    const consularOfficerDropdown = document.getElementById('consular_officer');

    // Define consular officers for each consulate
    const consularOfficers = {
        '1': ["Afnaan Mohammad", "Abhirup M"],
        '2': ["Sean Sougaijam", "Shadevade Gopal"]
        // Add more consular officers for other consulates as needed
    };

    // Update consular officer options when the consulate dropdown changes
    consulateDropdown.addEventListener('change', function () {
        const selectedConsulate = consulateDropdown.value; // Corrected ID
        const officers = consularOfficers[selectedConsulate];

        // Set default options for consular officer dropdown
        const defaultOfficers = consularOfficers['1'];

        // Clear existing options
        consularOfficerDropdown.innerHTML = '';

        // Add a default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.text = 'Select Consular Officer';
        consularOfficerDropdown.appendChild(defaultOption);

        // Add new options
        officers.forEach(officer => {
            const option = document.createElement('option');
            option.value = officer;
            option.text = officer;
            consularOfficerDropdown.appendChild(option);
        });
    });

    const changeEvent = new Event('change');
    consulateDropdown.dispatchEvent(changeEvent);

    // Update consular officer options when the consulate dropdown changes
    consulateDropdown.addEventListener('change', function () {
        const selectedConsulate = consulateDropdown.value;
        const officers = consularOfficers[selectedConsulate];

        // Clear existing options
        consularOfficerDropdown.innerHTML = '';

        // Add new options
        officers.forEach(officer => {
            const option = document.createElement('option');
            option.value = officer;
            option.text = officer;
            consularOfficerDropdown.appendChild(option);
        });
    });

    searchButton.addEventListener('click', function () {
        const passportNumber = document.getElementById('passportNumber').value;
    
        // Fetch and display data based on passport number
        fetch(`http://localhost:3000/visa_applications?passportNumber=${passportNumber}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Log the entire response data
                console.log('Received data for passport number:', data);
    
                // Check if the expected properties are present in the data
                if (Array.isArray(data) && data.length > 0) {
                    const visaApplicationData = data[0]; // Access the first element of the array
    
                    if ('first_name' in visaApplicationData && 'last_name' in visaApplicationData && 'nationality' in visaApplicationData) {
                        // Process the data and display it in the readResult div
                        console.log('Processing data:', visaApplicationData);
    
                        document.getElementById('firstNameResult').innerText = visaApplicationData.first_name;
                        document.getElementById('lastNameResult').innerText = visaApplicationData.last_name;
                        document.getElementById('nationalityResult').innerText = visaApplicationData.nationality;
    
                        // Check if document details are present
                        if ('document_name' in visaApplicationData && 'document_type' in visaApplicationData && 'document_data' in visaApplicationData) {
                            // Display document details or handle as needed
                            console.log('Document Details:', visaApplicationData.document_name, visaApplicationData.document_type);
    
                            // Update your code to display document details as needed
                        } else {
                            console.error('Error: Data structure is missing document details.');
                            // Handle the case where document details are missing
                        }

                        // Display application status and date
                        const applicationStatusResult = document.getElementById('applicationStatusResult');
                        const applicationDateResult = document.getElementById('applicationDateResult');

                        if ('application_status' in visaApplicationData && visaApplicationData.application_status !== null) {
                            applicationStatusResult.innerText = 'Application Status: ' + visaApplicationData.application_status;
                        } else {
                            applicationStatusResult.innerText = 'Application Status: N/A';
                        }

                        if ('application_date' in visaApplicationData && visaApplicationData.application_date !== null) {
                            applicationDateResult.innerText = 'Application Date: ' + visaApplicationData.application_date;
                        } else {
                            applicationDateResult.innerText = 'Application Date: N/A';
                        }

                        // Log the visaApplicationData
                        console.log('Visa Application Data:', visaApplicationData);

    
                        // Show the readResult div
                        document.getElementById('readResult').style.display = 'block';
                    } else {
                        // If the expected properties are not present, show an error
                        console.error('Error: Data structure is not as expected.');
                        document.getElementById('readResult').innerHTML = 'Error in data structure.';
                    }
                } else {
                    console.error('Error: Received data is not in the expected format.');
                    document.getElementById('readResult').innerHTML = 'Error in data structure.';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('readResult').innerHTML = 'Error fetching data.';
            });
    });
    
    
    visaApplicationForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Get form data and submit to the server
        const formData = new FormData(visaApplicationForm);
        fetch('http://localhost:3000/visa_applications', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Process the response data if needed
            console.log(data);

            // Reset the form
            visaApplicationForm.reset();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
