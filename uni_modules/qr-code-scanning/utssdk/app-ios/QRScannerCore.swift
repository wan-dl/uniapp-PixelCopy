import UIKit
import AVFoundation
import Photos

@objc(QRScannerCore)
class QRScannerCore: NSObject, AVCaptureMetadataOutputObjectsDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    
    @objc static let shared = QRScannerCore()
    
    private var captureSession: AVCaptureSession?
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var backButton: UIButton?
    private var galleryButton: UIButton?
    private var onSuccess: ((String) -> Void)?
    private var onFail: ((String) -> Void)?
    private var currentViewController: UIViewController?
    
    @objc func startScanning(
        _ viewController: UIViewController,
        _ onSuccess: @escaping (String) -> Void,
        _ onFail: @escaping (String) -> Void,
        _ onBackClick: @escaping () -> Void,
        _ onGalleryClick: @escaping () -> Void
    ) {
        // Check camera permission
        let status = AVCaptureDevice.authorizationStatus(for: .video)
        if status == .denied || status == .restricted {
            onFail("Camera permission denied")
            return
        }
        
        if status == .notDetermined {
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    if granted {
                        self.setupCamera(viewController, onSuccess, onFail, onBackClick, onGalleryClick)
                    } else {
                        onFail("Camera permission denied")
                    }
                }
            }
            return
        }
        
        setupCamera(viewController, onSuccess, onFail, onBackClick, onGalleryClick)
    }
    
    private func setupCamera(
        _ viewController: UIViewController,
        _ onSuccess: @escaping (String) -> Void,
        _ onFail: @escaping (String) -> Void,
        _ onBackClick: @escaping () -> Void,
        _ onGalleryClick: @escaping () -> Void
    ) {
        self.currentViewController = viewController
        self.onSuccess = onSuccess
        self.onFail = onFail
        
        guard let device = AVCaptureDevice.default(for: .video) else {
            onFail("Camera not available")
            return
        }
        
        do {
            let input = try AVCaptureDeviceInput(device: device)
            let session = AVCaptureSession()
            
            if session.canAddInput(input) {
                session.addInput(input)
            }
            
            let output = AVCaptureMetadataOutput()
            if session.canAddOutput(output) {
                session.addOutput(output)
                output.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
                output.metadataObjectTypes = [.qr]
            }
            
            let preview = AVCaptureVideoPreviewLayer(session: session)
            preview.frame = viewController.view.layer.bounds
            preview.videoGravity = .resizeAspectFill
            viewController.view.layer.addSublayer(preview)
            
            captureSession = session
            previewLayer = preview
            
            addBackButton(to: viewController.view, onClick: onBackClick)
            addGalleryButton(to: viewController.view, onClick: onGalleryClick)
            
            DispatchQueue.global(qos: .userInitiated).async {
                session.startRunning()
            }
        } catch {
            onFail("Failed to initialize camera: \(error.localizedDescription)")
        }
    }
    
    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        if let metadataObject = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
           let stringValue = metadataObject.stringValue {
            onSuccess?(stringValue)
        }
    }
    
    @objc func cleanup() {
        captureSession?.stopRunning()
        previewLayer?.removeFromSuperlayer()
        backButton?.removeFromSuperview()
        galleryButton?.removeFromSuperview()
        
        captureSession = nil
        previewLayer = nil
        backButton = nil
        galleryButton = nil
        currentViewController = nil
        onSuccess = nil
        onFail = nil
        backClickHandler = nil
        galleryClickHandler = nil
    }
    
    @objc func openGallery(_ viewController: UIViewController) {
        let picker = UIImagePickerController()
        picker.sourceType = .photoLibrary
        picker.delegate = self
        viewController.present(picker, animated: true)
    }
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        picker.dismiss(animated: true)
        
        if let image = info[.originalImage] as? UIImage {
            processGalleryImage(image)
        } else {
            onFail?("Failed to get image")
        }
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        picker.dismiss(animated: true)
    }
    
    private func processGalleryImage(_ image: UIImage) {
        guard let ciImage = CIImage(image: image) else {
            onFail?("Failed to process image")
            return
        }
        
        let detector = CIDetector(ofType: CIDetectorTypeQRCode, context: nil, options: [CIDetectorAccuracy: CIDetectorAccuracyHigh])
        let features = detector?.features(in: ciImage) as? [CIQRCodeFeature]
        
        if let qrCode = features?.first?.messageString {
            onSuccess?(qrCode)
        } else {
            onFail?("No QR code found in image")
        }
    }
    
    private func addBackButton(to view: UIView, onClick: @escaping () -> Void) {
        let button = UIButton(type: .custom)
        button.frame = CGRect(x: 24, y: 60, width: 48, height: 48)
        button.backgroundColor = UIColor(white: 0, alpha: 0.5)
        button.layer.cornerRadius = 24
        button.setImage(createBackIcon(size: 24), for: .normal)
        button.addTarget(self, action: #selector(backButtonTapped), for: .touchUpInside)
        view.addSubview(button)
        backButton = button
        backClickHandler = onClick
    }
    
    private func addGalleryButton(to view: UIView, onClick: @escaping () -> Void) {
        let button = UIButton(type: .custom)
        let screenWidth = view.bounds.width
        let screenHeight = view.bounds.height
        button.frame = CGRect(x: screenWidth - 80, y: screenHeight - 160, width: 56, height: 56)
        button.backgroundColor = UIColor(white: 0, alpha: 0.5)
        button.layer.cornerRadius = 28
        button.setImage(createGalleryIcon(size: 24), for: .normal)
        button.addTarget(self, action: #selector(galleryButtonTapped), for: .touchUpInside)
        view.addSubview(button)
        galleryButton = button
        galleryClickHandler = onClick
    }
    
    private var backClickHandler: (() -> Void)?
    private var galleryClickHandler: (() -> Void)?
    
    @objc private func backButtonTapped() {
        backClickHandler?()
    }
    
    @objc private func galleryButtonTapped() {
        galleryClickHandler?()
    }
    
    private func createBackIcon(size: CGFloat) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: size, height: size))
        return renderer.image { ctx in
            let path = UIBezierPath()
            let centerY = size / 2
            path.move(to: CGPoint(x: size * 0.7, y: centerY))
            path.addLine(to: CGPoint(x: size * 0.3, y: centerY))
            path.move(to: CGPoint(x: size * 0.3, y: centerY))
            path.addLine(to: CGPoint(x: size * 0.45, y: centerY - size * 0.2))
            path.move(to: CGPoint(x: size * 0.3, y: centerY))
            path.addLine(to: CGPoint(x: size * 0.45, y: centerY + size * 0.2))
            
            UIColor.white.setStroke()
            path.lineWidth = 3
            path.lineCapStyle = .round
            path.stroke()
        }
    }
    
    private func createGalleryIcon(size: CGFloat) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: size, height: size))
        return renderer.image { ctx in
            let padding = size * 0.15
            let rect = CGRect(x: padding, y: padding, width: size - 2 * padding, height: size - 2 * padding)
            
            UIColor.white.setStroke()
            let roundedRect = UIBezierPath(roundedRect: rect, cornerRadius: 3)
            roundedRect.lineWidth = 2
            roundedRect.stroke()
            
            UIColor.white.setFill()
            let path = UIBezierPath()
            path.move(to: CGPoint(x: padding + (size - 2 * padding) * 0.2, y: size - padding - (size - 2 * padding) * 0.2))
            path.addLine(to: CGPoint(x: padding + (size - 2 * padding) * 0.5, y: padding + (size - 2 * padding) * 0.4))
            path.addLine(to: CGPoint(x: size - padding, y: size - padding - (size - 2 * padding) * 0.2))
            path.fill()
            
            let circle = UIBezierPath(arcCenter: CGPoint(x: size - padding - (size - 2 * padding) * 0.25, y: padding + (size - 2 * padding) * 0.25), radius: (size - 2 * padding) * 0.12, startAngle: 0, endAngle: .pi * 2, clockwise: true)
            circle.fill()
        }
    }
}
