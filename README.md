# NIGGAS - Weekly Monitoring Sheet Portal

A premium, offline-first web application designed for tutors to manage active batches, fill in weekly activity reports, and easily send them via Yahoo Mail (Turbify).

---

## Key Features

- **July Demo Template**: Pre-loaded with settings and batch details matching your July Frontend program (Daniel Anyamene) so it is ready to use immediately.
- **Offline & Private**: Built entirely using HTML, CSS, and JavaScript with zero backend dependencies. All data is saved on the user's computer inside the browser's **Local Storage**, keeping details private.
- **Automatic Monthly Reset**: When a new calendar month starts (e.g. from July to August), the app automatically resets the weekly logs to a blank sheet for Week 1 entry, while preserving active batches and profile details.
- **Online Date Sync**: Automatically fetches Lagos/local network date, month, and year from an atomic clock API (`worldtimeapi.org`), falling back to the local computer clock if offline. This prevents errors caused by wrong computer system clocks.
- **Word Document Downloads**: Download standard, professionally-formatted `.doc` files that open natively in Microsoft Word.
- **Clipboard Rich Text Table**: Copy rich HTML tables straight to the clipboard to paste them into email bodies, preserving gridlines, colors, and layout structure.
- **Compose-and-Review Workflow**: Opens Yahoo Mail (Turbify) Compose in a new tab pre-filled with the recipient, subject line, and detailed text summaries, letting you review, CC, and edit details before sending manually.

---

## How to Run the App

1. Clone or download this repository.
2. Double-click the **[index.html](index.html)** file in your file explorer to open it in any web browser.
3. Or, if you want to run it via a local server, navigate to the folder and run:
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000/index.html` in your browser.

---

## File Structure

- `index.html` - UI grid layouts, settings inputs, forms, and preview sheets.
- `styles.css` - Custom styling carrying glassmorphism, responsive styles, and purple/blue/cyan logo gradients.
- `app.js` - Data controllers, LocalStorage managers, document export compilation, and atomic clock synchronization.
