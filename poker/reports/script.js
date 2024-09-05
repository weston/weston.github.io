let fullFileName = ''; // Store the complete filename for polling

// Password protection logic
function checkPassword() {
  const passwordInput = document.getElementById('passwordInput').value;
  const correctPassword = "wizardoftime"; // Set your simple string password here

  // Check if the password is correct, then unlock the UI
  if (passwordInput === correctPassword) {
    document.querySelector('.password-container').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
  }
}

async function uploadCsv() {
  const fileInput = document.getElementById('csvFile');
  const index = document.getElementById('position').value;
  const action = document.getElementById('action').value;
  const street = document.getElementById('street').value;
  const hashDisplay = document.getElementById('hashDisplay');
  const spinner = document.getElementById('spinner');
  const waitingMessage = document.getElementById('waitingMessage');
  const doneMessage = document.getElementById('doneMessage');

  if (fileInput.files.length === 0) {
    alert('Please select a CSV file.');
    return;
  }

  const file = fileInput.files[0];

  // Show spinner and waiting message
  spinner.style.display = 'block';
  waitingMessage.style.display = 'block';
  doneMessage.style.display = 'none'; // Hide done message

  // Generate the hash for the filename
  const fileHash = await generateHash(file);

  // Construct the complete filename
  fullFileName = `${fileHash}_${street}_${action}_${index}.csv`;

  // Convert the file to base64
  const base64File = await fileToBase64(file);

  const apiEndpoint = 'https://f2mq53hegotvsezb7a4n5wxbde0ituuk.lambda-url.us-east-1.on.aws/'; // Your API URL

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'file-name': fullFileName
      },
      body: JSON.stringify({
        isBase64Encoded: true,
        body: base64File,
        index: index,
        action: action,
        street: street
      })
    });

    if (response.ok) {
      // Show hash display and keep waiting message + spinner
      hashDisplay.textContent = `File Name: ${fullFileName}`;
      hashDisplay.style.display = 'block';

      // Start polling to check if the file exists
      pollForFile();
    } else {
      console.error('Upload failed:', await response.json());
      spinner.style.display = 'none'; // Hide spinner on failure
      waitingMessage.style.display = 'none'; // Hide waiting message on failure
    }
  } catch (error) {
    console.error('Error:', error);
    spinner.style.display = 'none'; // Hide spinner on error
    waitingMessage.style.display = 'none'; // Hide waiting message on error
  }
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Helper function to generate a hash for the filename
async function generateHash(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Poll for the file in the S3 bucket
function pollForFile() {
  const checkFileUrl = `https://4ni4eh3zreniodbuzao4e2pj6i0sfrhy.lambda-url.us-east-1.on.aws/?filename=${encodeURIComponent(fullFileName)}`;
  const spinner = document.getElementById('spinner');
  const waitingMessage = document.getElementById('waitingMessage');
  const doneMessage = document.getElementById('doneMessage');

  const intervalId = setInterval(async () => {
    try {
      const response = await fetch(checkFileUrl);
      if (response.ok) {
        const fileContent = await response.text();
        // File is found, download it
        downloadFile(fileContent, fullFileName);
        clearInterval(intervalId); // Stop polling
        waitingMessage.style.display = 'none'; // Hide waiting message
        spinner.style.display = 'none'; // Hide spinner
        doneMessage.style.display = 'block'; // Show "Done"
      } else if (response.status === 404) {
        console.log('File not found yet. Polling...');
      } else {
        throw new Error('Error checking file');
      }
    } catch (error) {
      console.error('Error checking for file:', error);
      clearInterval(intervalId); // Stop polling on error
      spinner.style.display = 'none'; // Hide spinner on error
      waitingMessage.style.display = 'none'; // Hide waiting message on error
    }
  }, 5000); // Poll every 5 seconds
}

// Helper function to download the file
function downloadFile(content, fileName) {
  const blob = new Blob([content], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
