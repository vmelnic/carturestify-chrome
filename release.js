const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const manifestPath = path.join(__dirname, 'manifest.json');
const extensionPath = path.join(__dirname, 'extension.json');
const releaseFolder = path.join(__dirname, 'releases');

fs.readFile(manifestPath, 'utf8', (err, manifestData) => {
  if (err) {
    console.error('Error reading manifest.json:', err);
    return;
  }

  const manifest = JSON.parse(manifestData);
  const version = manifest.version;

  if (!version) {
    console.error('Version not found in manifest.json');
    return;
  }

  const zipFileName = `carturestify-${version}.zip`;
  const zipFilePath = path.join(releaseFolder, zipFileName);

  if (fs.existsSync(zipFilePath)) {
    console.error(`Error: Archive ${zipFileName} already exists in the releases folder.`);
    return;
  }

  fs.readFile(extensionPath, 'utf8', (err, extensionData) => {
    if (err) {
      console.error('Error reading extension.json:', err);
      return;
    }

    const files = JSON.parse(extensionData);

    if (!files || files.length === 0) {
      console.error('No files found in extension.json');
      return;
    }

    if (!fs.existsSync(releaseFolder)) {
      fs.mkdirSync(releaseFolder);
    }

    const zipCommand = `zip -r "${zipFilePath}" ${files.map(file => `"${file}"`).join(' ')}`;

    exec(zipCommand, (err, stdout, stderr) => {
      if (err) {
        console.error('Error creating zip archive:', err);
        return;
      }

      if (stderr) {
        console.error('stderr:', stderr);
        return;
      }

      console.log(`Archive ${zipFileName} has been created successfully.`);
    });
  });
});
