// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage(">>> Mobile Helper Extension ACTIVATE function called!");

	console.log('>>> Mobile Helper extension activating...');

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "mobile-helper" is now active!');

	// Command to show the floating toolbar
	const showToolbarCommand = vscode.commands.registerCommand('mobile-helper.showToolbar', () => {
		// Create and show a new webview panel
		const panel = vscode.window.createWebviewPanel(
			'mobileToolbar', // Identifies the type of the webview. Used internally
			'Mobile Toolbar', // Title of the panel displayed to the user
			vscode.ViewColumn.Active, // Try opening in the active column
			{
				// Enable scripts in the webview
				enableScripts: true,
				// Retain context when hidden
				retainContextWhenHidden: true,
			}
		);

		// Set the HTML content for the webview
		panel.webview.html = getWebviewContent();

		// Handle messages from the webview (for button clicks, etc.)
		panel.webview.onDidReceiveMessage(
			message => {
				// Get the active text editor, if any
				const editor = vscode.window.activeTextEditor;
				switch (message.command) {
					case 'moveCursor': {
						const { direction, isSelecting } = message;
						let commandArgs: any = { value: 1, select: isSelecting };

						if (direction === 'up') {
							commandArgs.to = 'up';
							commandArgs.by = 'line';
						} else if (direction === 'down') {
							commandArgs.to = 'down';
							commandArgs.by = 'line';
						} else if (direction === 'left') {
							commandArgs.to = 'left';
							commandArgs.by = 'character';
						} else if (direction === 'right') {
							commandArgs.to = 'right';
							commandArgs.by = 'character';
						}

						if (commandArgs.to && editor) { // Check if editor exists
							vscode.commands.executeCommand('cursorMove', commandArgs);
						}
						return;
					}
					case 'selectWord': {
						if (editor) {
							// Use editor.action.smartSelect.expand or similar command
							// Note: "editor.action.wordSelect" might not exist, using expand/shrink
							vscode.commands.executeCommand('editor.action.smartSelect.expand');
						}
						return;
					}
					case 'expandSelection': {
						if (editor) {
							// Depending on direction, expand or shrink selection
							// This might need more complex logic based on current selection
							// Using smartSelect expand/shrink as a starting point
							if (message.direction === 'right') {
								vscode.commands.executeCommand('editor.action.smartSelect.expand');
							} else { // Assuming left means shrink for now
								vscode.commands.executeCommand('editor.action.smartSelect.shrink');
							}
						}
						return;
					}
					case 'insertSymbol': {
						if (editor) {
							const symbol = message.symbol;
							// Insert the symbol at the current cursor position(s)
							editor.edit(editBuilder => {
								editor.selections.forEach(selection => {
									// If there's a selection, replace it. Otherwise, insert at cursor.
									editBuilder.replace(selection, symbol);
								});
							}).then(() => {
								// Optional: Move cursor after the inserted symbol if needed
								// Might need adjustment based on desired behavior with multiple cursors
							});
						}
						return;
					}
					case 'copy': {
						if (editor) {
							vscode.commands.executeCommand('editor.action.clipboardCopyAction');
						}
						return;
					}
					case 'cut': {
						if (editor) {
							vscode.commands.executeCommand('editor.action.clipboardCutAction');
						}
						return;
					}
					case 'paste': {
						if (editor) {
							vscode.commands.executeCommand('editor.action.clipboardPasteAction');
						}
						return;
					}
					case 'duplicateLine': {
						if (editor) {
							// editor.action.copyLinesDownAction or editor.action.copyLinesUpAction
							vscode.commands.executeCommand('editor.action.copyLinesDownAction');
						}
						return;
					}
					case 'alert': // Example command (can be removed)
						vscode.window.showInformationMessage(message.text);
						return;
				}
			},
			undefined,
			context.subscriptions
		);

		// Dispose the panel when it's closed
		panel.onDidDispose(
			() => {
				// Clean up resources, etc.
			},
			null,
			context.subscriptions
		);

		 // Optional: Make the panel float (might require more advanced techniques or specific VS Code APIs if available)
		// This might involve positioning the webview itself or using other UI elements.
		// Setting ViewColumn.Active or Beside is the standard way. True floating might need CSS tricks within the webview.

	});

	context.subscriptions.push(showToolbarCommand);
}

// This method provides the HTML content for the webview panel
function getWebviewContent(): string {
	// Note: For security, consider using vscode.Uri.webviewUri to load local resources (CSS, JS)
	// For simplicity now, embedding CSS and JS directly.

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Mobile Toolbar</title>
	<style>
		/* Basic styling for the toolbar */
		body {
			padding: 0;
			margin: 0;
			overflow: hidden; /* Prevent scrolling */
		}
		.toolbar {
			position: absolute; /* Allows dragging */
			top: 10px; /* Initial position */
			left: 10px; /* Initial position */
			display: flex;
			flex-direction: column;
			padding: 8px;
			background-color: var(--vscode-editorWidget-background);
			border: 1px solid var(--vscode-editorWidget-border);
			box-shadow: 0 2px 8px var(--vscode-widget-shadow);
			border-radius: 6px;
			color: var(--vscode-editorWidget-foreground);
			cursor: grab; /* Indicate draggable */
			user-select: none; /* Prevent text selection during drag */
			z-index: 1000; /* Keep on top */
		}
		.toolbar:active {
			cursor: grabbing;
		}
		button {
			margin: 3px;
			padding: 6px 8px;
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			border: 1px solid var(--vscode-button-border, transparent);
			border-radius: 4px;
			cursor: pointer;
			font-size: 14px; /* Slightly larger for touch */
			min-width: 30px; /* Ensure minimum touch target size */
			text-align: center;
		}
		button:hover {
			background-color: var(--vscode-button-hoverBackground);
		}
		hr {
			border: none;
			border-top: 1px solid var(--vscode-editorWidget-border);
			margin: 5px 0;
			width: 100%;
		}
		.row { display: flex; justify-content: space-around; align-items: center; margin-bottom: 4px; }
		.cursor-arrows { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3px; align-items: center; justify-items: center; padding: 5px;}
		.cursor-arrows .spacer { grid-column: 2; height: 10px; } /* Empty cell in the middle */
		label { display: flex; align-items: center; cursor: pointer; padding: 5px; font-size: 13px; }
		input[type="checkbox"] { margin-right: 5px; }

		/* Specific button styling */
		#up, #down, #left, #right { font-weight: bold; padding: 4px 8px; }
		#select-word, #expand-left, #expand-right { font-size: 12px; padding: 5px; }
	</style>
</head>
<body>
	<!-- draggable="true" doesn't work well across iframe boundary, using JS -->
	<div class="toolbar" id="mobile-toolbar">
		<!-- Drag Handle (Optional, entire toolbar is draggable for now) -->
		<!-- <div class="drag-handle">☰</div> -->

		<div class="cursor-controls">
			 <div class="cursor-arrows">
				 <div class="spacer"></div><button id="up">↑</button><div class="spacer"></div>
				 <button id="left">←</button><div class="spacer"></div><button id="right">→</button>
				 <div class="spacer"></div><button id="down">↓</button><div class="spacer"></div>
			</div>
			<div class="row">
				<label><input type="checkbox" id="select-mode"> Select</label>
			</div>
			 <div class="row">
				<button id="select-word">Word</button>
				<button id="expand-left">←W</button> <!-- Shortened label -->
				<button id="expand-right">W→</button> <!-- Shortened label -->
			 </div>
		</div>
		<hr>
		 <div class="symbols row">
			<button>(</button> <button>)</button>
			<button>{</button> <button>}</button>
			<button>[</button> <button>]</button>
			<button>&lt;</button> <button>&gt;</button>
		</div>
		<hr>
		<div class="edit-actions row">
			<button id="copy">Copy</button>
			<button id="cut">Cut</button>
			<button id="paste">Paste</button>
		</div>
		 <div class="row">
			<button id="duplicate">Dup Line</button> <!-- Shortened label -->
		 </div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();
		const toolbar = document.getElementById('mobile-toolbar');
		const selectModeCheckbox = document.getElementById('select-mode'); // Get checkbox
		let isDragging = false;
		let startX, startY, initialX, initialY;

		// --- Drag Functionality ---
		toolbar.addEventListener('mousedown', (e) => {
			// Only drag if the mousedown is directly on the toolbar background, not on buttons/inputs
			 if (e.target === toolbar || e.target.classList.contains('drag-handle')) {
				isDragging = true;
				startX = e.clientX;
				startY = e.clientY;
				initialX = toolbar.offsetLeft;
				initialY = toolbar.offsetTop;
				toolbar.style.cursor = 'grabbing';
				// Prevent text selection during drag
				e.preventDefault();
			 }
		});

		document.addEventListener('mousemove', (e) => {
			if (!isDragging) return;

			const currentX = e.clientX;
			const currentY = e.clientY;
			const dx = currentX - startX;
			const dy = currentY - startY;

			// Calculate new position
			let newLeft = initialX + dx;
			let newTop = initialY + dy;

			// Basic boundary checks (relative to viewport) - adjust as needed
			const rect = toolbar.getBoundingClientRect();
			const parentWidth = window.innerWidth;
			const parentHeight = window.innerHeight;

			if (newLeft < 0) newLeft = 0;
			if (newTop < 0) newTop = 0;
			if (newLeft + rect.width > parentWidth) newLeft = parentWidth - rect.width;
			if (newTop + rect.height > parentHeight) newTop = parentHeight - rect.height;


			toolbar.style.left = \`\${newLeft}px\`;
			toolbar.style.top = \`\${newTop}px\`;
		});

		document.addEventListener('mouseup', (e) => {
			if (isDragging) {
				isDragging = false;
				toolbar.style.cursor = 'grab';
			}
		});

		// Prevent mouseup on buttons from ending drag incorrectly
		toolbar.querySelectorAll('button, input, label').forEach(el => {
			el.addEventListener('mousedown', (e) => {
				e.stopPropagation(); // Prevent toolbar mousedown when clicking buttons
			});
		});


		// --- Button Click Handlers ---
		function postCommand(command, data = {}) {
			const isSelecting = selectModeCheckbox.checked;
			vscode.postMessage({ command, isSelecting, ...data });
		}

		// Cursor Movement
		document.getElementById('up').addEventListener('click', () => postCommand('moveCursor', { direction: 'up' }));
		document.getElementById('down').addEventListener('click', () => postCommand('moveCursor', { direction: 'down' }));
		document.getElementById('left').addEventListener('click', () => postCommand('moveCursor', { direction: 'left' }));
		document.getElementById('right').addEventListener('click', () => postCommand('moveCursor', { direction: 'right' }));

		// Selection
		document.getElementById('select-word').addEventListener('click', () => postCommand('selectWord'));
		document.getElementById('expand-left').addEventListener('click', () => postCommand('expandSelection', { direction: 'left' }));
		document.getElementById('expand-right').addEventListener('click', () => postCommand('expandSelection', { direction: 'right' }));

		// Symbols - Add IDs to buttons or query them differently
		// Using querySelectorAll and textContent for simplicity here
		toolbar.querySelectorAll('.symbols button').forEach(button => {
			button.addEventListener('click', (e) => {
				const symbol = e.target.textContent;
				// Special handling for < and > as they are HTML entities
				let actualSymbol = symbol;
				if (symbol === '<') actualSymbol = '<';
				if (symbol === '>') actualSymbol = '>';
				postCommand('insertSymbol', { symbol: actualSymbol });
			});
		});

		// Edit Actions
		document.getElementById('copy').addEventListener('click', () => postCommand('copy'));
		document.getElementById('cut').addEventListener('click', () => postCommand('cut'));
		document.getElementById('paste').addEventListener('click', () => postCommand('paste'));
		document.getElementById('duplicate').addEventListener('click', () => postCommand('duplicateLine'));

	</script>
</body>
</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
