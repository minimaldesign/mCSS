const fs = require("fs");
const path = require("path");

// Path to icons folder (relative to the /tools directory)
const iconsFolder = path.join(__dirname, "../assets/icons");

// Read all SVG files in the folder
fs.readdir(iconsFolder, (err, files) => {
  if (err) {
    console.error("Error reading the icons folder:", err);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(iconsFolder, file);

    // Process only .svg files
    if (path.extname(file) === ".svg") {
      const fileNameWithoutExt = path.basename(file, ".svg");

      // Read the SVG file
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error(`Error reading file ${file}:`, err);
          return;
        }

        let updatedData = data;
        let changes = [];

        // Remove <!DOCTYPE> declaration
        if (/<!DOCTYPE[^>]*>/i.test(updatedData)) {
          updatedData = updatedData.replace(/<!DOCTYPE[^>]*>/i, "");
          changes.push("DOCTYPE declaration removed");
        }

        // Remove XML declaration
        if (/<\?xml[\s\S]*?\?>\s*/.test(updatedData)) {
          updatedData = updatedData.replace(/<\?xml[\s\S]*?\?>\s*/g, "");
          changes.push("XML declaration removed");
        }

        // Remove xmlns attributes (keep only xmlns="http://www.w3.org/2000/svg")
        if (/xmlns:[a-z]+="[^"]*"/g.test(updatedData)) {
          updatedData = updatedData.replace(/xmlns:[a-z]+="[^"]*"/g, "");
          changes.push("unnecessary xmlns attributes removed");
        }

        // Remove xml:space="preserve" if present
        if (/xml:space="preserve"/.test(updatedData)) {
          updatedData = updatedData.replace(/xml:space="preserve"/g, "");
          changes.push('xml:space="preserve" removed');
        }

        // Remove duplicate id attributes and ensure proper formatting
        if (/\s+id="[^"]*"/g.test(updatedData)) {
          updatedData = updatedData.replace(/\s+id="[^"]*"/g, ""); // Remove all id attributes
          changes.push("duplicate id attributes removed");
        }

        // Add the correct id attribute
        const idRegex = new RegExp(`<svg[^>]*id="${fileNameWithoutExt}"[^>]*>`);
        if (!idRegex.test(updatedData)) {
          if (/<svg([^>]*)>/.test(updatedData)) {
            updatedData = updatedData.replace(
              /<svg([^>]*)>/,
              `<svg$1 id="${fileNameWithoutExt}">`
            );
            changes.push("id added or updated");
          }
        }

        // Remove any class attributes
        if (/\sclass="[^"]*"/.test(updatedData)) {
          updatedData = updatedData.replace(/\sclass="[^"]*"/g, "");
          changes.push("class removed");
        }

        // Remove any comments
        if (/<!--[\s\S]*?-->/.test(updatedData)) {
          updatedData = updatedData.replace(/<!--[\s\S]*?-->/g, "");
          changes.push("comments removed");
        }

        // Replace multiple spaces with a single space
        updatedData = updatedData.replace(/\s{2,}/g, " ");

        // Remove unnecessary whitespace
        updatedData = updatedData.trim();

        // Write the updated SVG back to the file only if changes were made
        if (changes.length > 0 && updatedData !== data) {
          fs.writeFile(filePath, updatedData, "utf8", (err) => {
            if (err) {
              console.error(`Error writing file ${file}:`, err);
              return;
            }
            console.log(`Updated ${file}: ${changes.join(", ")}.`);
          });
        }
      });
    }
  });
});
