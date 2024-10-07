// // Load the Google API client library
// function loadGoogleDriveAPI() {
//     gapi.load('client', initClient);
//   }
  
//   // Initialize the API client
//   function initClient() {
//     gapi.client.init({
//       apiKey: 'AIzaSyCuW7aDaVX7blMai9vg3s9aYNRhp6VZxg4',
//       clientId: '538935112646-flm4qoqqqprcko2jchkemmdn04hqjb0h.apps.googleusercontent.com',
//       discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
//       scope: 'https://www.googleapis.com/auth/drive.readonly'
//     }).then(function() {
//       // API is initialized, list files in the folder
//       listFiles();
//     });
//   }
  
//   // List files in the specified folder
//   function listFiles() {
//     gapi.client.drive.files.list({
//       q: "'FOLDER_ID' in parents and mimeType contains 'image/'",
//       fields: 'files(id, name, webContentLink)'
//     }).then(function(response) {
//       var files = response.result.files;
//       displayImages(files);
//     });
//   }
  
//   // Display images in the HTML document
//   function displayImages(files) {
//     var imageContainer = document.getElementById('image-container');
//     files.forEach(function(file) {
//       var img = document.createElement('img');
//       img.src = 'https://drive.google.com/uc?id=' + file.id;
//       img.alt = file.name;
//       imageContainer.appendChild(img);
//     });
//   }
  
//   // Call this function to start the process
//   loadGoogleDriveAPI();

// First, load the Google API client library
// class GoogleDriveImageFetcher {
//     constructor(apiKey) {
//         this.API_KEY = apiKey;
//         this.BASE_URL = 'https://www.googleapis.com/drive/v3';
//     }

//     async fetchImagesFromFolder(folderId) {
//         try {
//             const url = `${this.BASE_URL}/files?q='${folderId}' in parents and mimeType contains 'image/' and trashed=false&key=${this.API_KEY}&fields=files(id,name,webContentLink,thumbnailLink)&pageSize=100`;

//             const response = await fetch(url, {
//                 method: 'GET',
//                 headers: {
//                     'Accept': 'application/json'
//                 }
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             const data = await response.json();
//             return data.files.map(file => ({
//                 id: file.id,
//                 name: file.name,
//                 downloadUrl: `https://drive.google.com/uc?export=view&id=${file.id}`,
//                 thumbnailUrl: file.thumbnailLink
//             }));
//         } catch (error) {
//             console.error('Error fetching images:', error);
//             throw error;
//         }
//     }

//     async displayImages(containerId, folderId) {
//         const container = document.getElementById(containerId);
//         if (!container) {
//             throw new Error('Container element not found');
//         }

//         // Add loading state
//         container.innerHTML = '<div>Loading images...</div>';

//         try {
//             const images = await this.fetchImagesFromFolder(folderId);
            
//             if (images.length === 0) {
//                 container.innerHTML = '<div>No images found in the folder</div>';
//                 return;
//             }

//             container.innerHTML = images.map(image => `
//                 <div class="image-container" style="margin: 10px; display: inline-block;">
//                     <img 
//                         src="${image.downloadUrl}" 
//                         alt="${image.name}"
//                         style="max-width: 200px; height: auto;"
//                         onerror="this.onerror=null; this.src='${image.thumbnailLink}'"
//                     />
//                     <p style="text-align: center;">${image.name}</p>
//                 </div>
//             `).join('');
//         } catch (error) {
//             container.innerHTML = `<div>Error loading images: ${error.message}</div>`;
//         }
//     }
// }

class GoogleDriveImageFetcher {
    constructor(apiKey) {
        this.API_KEY = apiKey;
        this.BASE_URL = 'https://www.googleapis.com/drive/v3';
    }

    async fetchImagesFromFolder(folderId) {
        try {
            // Expanded query to include specific image types
            const query = encodeURIComponent(`'${folderId}' in parents and (
                mimeType contains 'image/jpeg' or 
                mimeType contains 'image/png' or 
                mimeType contains 'image/gif' or 
                mimeType contains 'image/bmp' or 
                mimeType contains 'image/webp' or 
                mimeType contains 'image/svg+xml'
            ) and trashed=false`);

            const url = `${this.BASE_URL}/files?q=${query}&key=${this.API_KEY}&fields=files(id,name,mimeType,webContentLink,thumbnailLink)&pageSize=100`;

            console.log('Fetching from URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (!data.files || data.files.length === 0) {
                console.log('No files found in the response');
                return [];
            }

            return data.files.map(file => {
                console.log('Processing file:', file);
                return {
                    id: file.id,
                    name: file.name,
                    mimeType: file.mimeType,
                    downloadUrl: `https://drive.google.com/uc?export=view&id=${file.id}`,
                    thumbnailUrl: file.thumbnailLink
                };
            });
        } catch (error) {
            console.error('Error fetching images:', error);
            throw error;
        }
    }

    async displayImages(containerId, folderId) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container element with ID "${containerId}" not found`);
        }

        container.innerHTML = '<div>Loading images...</div>';

        try {
            console.log('Starting image fetch for folder:', folderId);
            const images = await this.fetchImagesFromFolder(folderId);
            
            if (images.length === 0) {
                container.innerHTML = `
                    <div>
                        <p>No images found in the folder. Please check:</p>
                        <ul>
                            <li>The folder ID is correct: ${folderId}</li>
                            <li>The folder contains image files (JPG, PNG, GIF, etc.)</li>
                            <li>The folder is shared publicly or has proper permissions</li>
                            <li>Check browser console for detailed API response</li>
                        </ul>
                    </div>`;
                return;
            }

            container.innerHTML = images.map(image => `
                <div class="image-container" style="margin: 10px; display: inline-block;">
                    <img 
                        src="${image.downloadUrl}" 
                        alt="${image.name}"
                        style="max-width: 200px; height: auto;"
                        onerror="this.onerror=null; this.src='${image.thumbnailUrl || ''}'"
                    />
                    <p style="text-align: center;">${image.name}</p>
                    <p style="font-size: 12px; color: #666;">${image.mimeType}</p>
                </div>
            `).join('');
        } catch (error) {
            container.innerHTML = `<div>Error loading images: ${error.message}</div>`;
            console.error('Display error:', error);
        }
    }
}

// Usage example:
// HTML: <div id="image-container"></div>
// JavaScript:
const API_KEY = 'AIzaSyCuW7aDaVX7blMai9vg3s9aYNRhp6VZxg4';
const FOLDER_ID = '1rO6kGP3PX_zI7xo2R2-uMUob3bKj6oVC';

// Initialize the fetcher
const imageFetcher = new GoogleDriveImageFetcher(API_KEY);

// Display images
imageFetcher.displayImages('image-container', FOLDER_ID)
    .catch(error => console.error('Failed to display images:', error));