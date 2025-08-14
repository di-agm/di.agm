/* Main Container */
.center-container {
  width: 100vw;   /* full viewport width */
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Page Rectangle */
.rect {
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(2,6,23,0.15);
  user-select: none;
  transition: width 0.4s ease, height 0.4s ease;
  position: relative;
  overflow: hidden;
}

/* Hamburger Menu */
.hamburger-menu {
  position: fixed;
  top: 20px;
  width: 40px;
  height: 40px;
  background-color: var(--menu-bg);
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 1010;
  box-shadow: var(--menu-shadow);
}

.hamburger-icon {
  width: 24px;
  height: 18px;
  position: relative;
  transform: rotate(0deg);
  transition: .5s ease-in-out;
}

.hamburger-icon span {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: white;
  border-radius: 2px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: .25s ease-in-out;
}

.hamburger-icon span:nth-child(1) { top: 0px; }
.hamburger-icon span:nth-child(2) { top: 8px; }
.hamburger-icon span:nth-child(3) { top: 16px; }

.hamburger-icon.open span:nth-child(1) {
  top: 8px;
  transform: rotate(135deg);
}

.hamburger-icon.open span:nth-child(2) {
  opacity: 0;
  left: -60px;
}

.hamburger-icon.open span:nth-child(3) {
  top: 8px;
  transform: rotate(-135deg);
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  height: 100%;
  background: var(--menu-bg);
  z-index: 1000;
  box-shadow: var(--menu-shadow);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  padding: 70px 15px 15px;
  color: var(--menu-text);
  overflow-y: auto;
}

.left-sidebar {
  left: 0;
  transform: translateX(-100%);
  width: 250px;
}

.right-sidebar {
  right: 0;
  transform: translateX(100%);
  width: 250px;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-section {
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 15px;
}

.sidebar-section h3 {
  margin-top: 0;
  font-size: 16px;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.sidebar-btn {
  padding: 8px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
  background-color: #333;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-btn:hover {
  background-color: var(--menu-hover);
}

.full-width {
  grid-column: span 2;
}

/* Color Picker */
.color-picker-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}

.color-option {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #444;
}

/* Size Buttons */
.font-size-options {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.size-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #333;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.size-btn:hover {
  background-color: var(--menu-hover);
}

/* Font Family Select */
.font-family-select {
  width: 100%;
  padding: 8px;
  margin-top: 10px;
  background: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Saved Layouts */
.saved-layouts {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 10px;
}

.layout-item {
  padding: 8px;
  margin-bottom: 5px;
  background: #333;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.layout-item button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

/* Modals */
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  z-index: 2000;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #222;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  color: white;
}

.modal-content input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border-radius: 4px;
  border: 1px solid #444;
  background: #333;
  color: white;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}
