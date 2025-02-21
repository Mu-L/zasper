# Initialize the project by installing frontend dependencies
.PHONY: init build start dev electron-package webapp-install
init:
	@echo "Initializing the project..."
	cd ui && npm install

# Build the frontend and backend
 
build: 
	@echo "Building the frontend and backend..."
	cd ui && npm run build
	go build .

# Default target: run both frontend and backend in development
dev:
	@echo "Starting the frontend and backend in development..."
	(cd ui && npm start) & go run .

# Run the Electron app in development
electron-dev:
	@echo "Starting the Electron app in development..."
	(go run .) & cd ui && npm run electron-dev		

# Package the Electron app
electron-package:
	@echo "Packaging the Electron app..."
	go build -o ./ui/build/zasper
	cd ui && npm run electron-package

# Install the web app
webapp-install: build
	@echo "Installing the web app..."
	go install .

# Clean up build artifacts
clean:
	@echo "Cleaning up..."
	rm -f zasper
	rm -rf ui/build
	rm -rf ui/dist
