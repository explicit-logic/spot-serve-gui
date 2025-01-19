<div align="center">
   <img align="center" width="128px" src="src-tauri/icons/128x128@2x.png" />
	<h1 align="center"><b>Spot Serve Desktop</b></h1>
  <br/>
</div>

The desktop companion app for Spot Serve - a seamless solution for developers to share quick, interactive previews of their websites. This desktop application works in conjunction with the [Spot Serve web platform](https://github.com/yakovenkodenis/spot-serve-web) to provide a streamlined experience for sharing local website previews.

## Features
- Simple drag-and-drop interface for website files or folders
- Automatic zip compression of your website files
- One-click upload and URL generation
- System tray integration for quick access
- Real-time preview status monitoring
- Secure WebRTC-based file sharing
- Cross-platform support (Windows, macOS, Linux)

## Installation

### Download
Download the latest version for your operating system from the [releases page](https://github.com/explicit-logic/spot-serve-gui/releases).

### Build from Source
1. Clone the repository:
    ```bash
    git clone git@github.com:explicit-logic/spot-serve-gui.git
    ```

2. Install dependencies:
    ```bash
    cd spot-serve-gui
    bun install
    ```

3. Run in development mode:
    ```bash
    bun run tauri dev
    ```

4. Build for your platform:
    ```bash
    bun run tauri build
    ```

## Usage

1. Launch the Spot Serve desktop application
2. Either:
   - Drag and drop your website folder into the application window
   - Click "Select Files" to choose your website files
   - Use the "Select Folder" option to choose an entire directory
3. The app will automatically compress your files and generate a shareable URL
4. Copy the generated URL and share it with your collaborators

## Integration with Spot Serve Web

This desktop application works seamlessly with the [Spot Serve web platform](https://github.com/yakovenkodenis/spot-serve-web). While the web platform handles the viewing experience, this desktop app manages the local file handling and sharing capabilities.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

## Related Projects

- [Spot Serve Web Platform](https://github.com/yakovenkodenis/spot-serve-web) - The web component of Spot Serve
