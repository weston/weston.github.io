let fullFileName = ''; // Store the complete filename for polling
let originalFileName = ''; // Store the original filename
let fileDownloaded = false; // Track whether the file has been downloaded
let pollingInterval = null; // To track polling interval

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
  resetState(); // Reset variables for a fresh upload

  const fileInput = document.getElementById('csvFile');
  const accessKeyInput = document.getElementById('accessKey').value; // Get Access Key input
  const index = document.getElementById('position').value;
  const action = document.getElementById('action').value;
  const street = document.getElementById('street').value;
  const player = document.getElementById('player').value;
  const hashDisplay = document.getElementById('hashDisplay');
  const spinner = document.getElementById('spinner');
  const waitingMessage = document.getElementById('waitingMessage');
  const doneMessage = document.getElementById('doneMessage');

  if (!accessKeyInput) {
    alert('Please enter the Access Key.');
    return;
  }

  if (fileInput.files.length === 0) {
    alert('Please select a CSV file.');
    return;
  }

  const file = fileInput.files[0];
  originalFileName = file.name; // Capture the original file name

  // Show spinner and waiting message
  spinner.style.display = 'block';
  waitingMessage.style.display = 'block';
  doneMessage.style.display = 'none'; // Hide done message

  // Generate the hash for the filename
  const fileHash = await generateHash(file);

  // Construct the complete filename, now including the selected player and original file name
  fullFileName = `${fileHash}_${street}_${action}_${index}_${player}_${originalFileName}`;

  const apiEndpoint = 'https://z4sarh2go5anhnwdtx7wugxkqi0rsall.lambda-url.us-east-1.on.aws/'; // Your Lambda URL

  try {
    // Request the pre-signed URL from the Lambda function
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_key: accessKeyInput, // Pass the access key
        file_name: fullFileName     // Pass the full file name
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get the pre-signed URL');
    }

    const data = await response.json();
    const uploadUrl = data.upload_url; // The pre-signed URL

    // Upload the file to the pre-signed URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    if (!uploadResponse.ok) {
      console.log(uploadResponse.text())
      throw new Error('Failed to upload the file');
    }

    // Show hash display and keep waiting message + spinner
    hashDisplay.textContent = `File Name: ${fullFileName}`;
    hashDisplay.style.display = 'block';

    // Start polling to check if the file exists
    pollForFile();

  } catch (error) {
    console.error('Error:', error);
    spinner.style.display = 'none'; // Hide spinner on failure
    waitingMessage.style.display = 'none'; // Hide waiting message on failure
  }
}

// Poll for the file in the S3 bucket
function pollForFile() {
  const checkFileUrl = `https://4ni4eh3zreniodbuzao4e2pj6i0sfrhy.lambda-url.us-east-1.on.aws/?filename=${encodeURIComponent(fullFileName)}`;
  const spinner = document.getElementById('spinner');
  const waitingMessage = document.getElementById('waitingMessage');
  const doneMessage = document.getElementById('doneMessage');

  pollingInterval = setInterval(async () => {
    if (fileDownloaded) {
      clearInterval(pollingInterval); // Stop polling if the file has already been downloaded
      return;
    }

    try {
      // Make a request to the Lambda function to check if the file exists
      const response = await fetch(checkFileUrl);
      if (response.ok) {
        const data = await response.json();
        const downloadUrl = data.download_url;

        // File is found, download it
        downloadFileFromS3(downloadUrl, fullFileName);
        clearInterval(pollingInterval); // Stop polling
        waitingMessage.style.display = 'none'; // Hide waiting message
        spinner.style.display = 'none'; // Hide spinner
        doneMessage.style.display = 'block'; // Show "Done"
        fileDownloaded = true; // Set fileDownloaded flag to true after downloading
      } else if (response.status === 404) {
        console.log('File not found yet. Polling...');
      } else {
        throw new Error('Error checking file');
      }
    } catch (error) {
      console.error('Error checking for file:', error);
      clearInterval(pollingInterval); // Stop polling on error
      spinner.style.display = 'none'; // Hide spinner on error
      waitingMessage.style.display = 'none'; // Hide waiting message on error
    }
  }, 3000); // Poll every 3 seconds
}

// Helper function to download the file from S3 using the pre-signed URL
function downloadFileFromS3(url, fileName) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  fileDownloaded = true; // Mark file as downloaded after downloading
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
  const hash = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  return hash.slice(0, hash.length / 4); // Using part of the hash for brevity
}

// Helper function to reset the state for a fresh upload
function resetState() {
  // Reset relevant variables
  fileDownloaded = false;
  fullFileName = '';
  originalFileName = '';

  // Clear previous polling if it was still running
  if (pollingInterval !== null) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }

  // Optionally clear UI elements
  document.getElementById('hashDisplay').style.display = 'none';
  document.getElementById('spinner').style.display = 'none';
  document.getElementById('waitingMessage').style.display = 'none';
  document.getElementById('doneMessage').style.display = 'none';
}
