package uts.sdk.modules.qrCodeScanning

import android.app.Activity
import android.content.Intent
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.view.Gravity
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.ImageView
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.BarcodeScanner
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.Executors

object ScannerCore {
    
    private var scanner: BarcodeScanner? = null
    private var cameraProvider: ProcessCameraProvider? = null
    private var previewView: PreviewView? = null
    private var backButton: ImageButton? = null
    private var galleryButton: ImageButton? = null
    private var executor: java.util.concurrent.ExecutorService? = null
    
    fun initScanner() {
        scanner = BarcodeScanning.getClient()
        executor = Executors.newSingleThreadExecutor()
    }
    
    fun createPreviewView(activity: Activity): PreviewView {
        previewView = PreviewView(activity).apply {
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }
        return previewView!!
    }
    
    fun startCamera(
        activity: Activity,
        onReady: (FrameLayout) -> Unit,
        onBackClick: () -> Unit,
        onGalleryClick: () -> Unit
    ) {
        val future = ProcessCameraProvider.getInstance(activity)
        future.addListener({
            val rootView = activity.window.decorView.findViewById<FrameLayout>(android.R.id.content)
            previewView?.let { rootView.addView(it) }
            
            backButton = createBackButton(activity, onBackClick)
            rootView.addView(backButton)
            
            galleryButton = createGalleryButton(activity, onGalleryClick)
            rootView.addView(galleryButton)
            
            cameraProvider = future.get()
            bindPreview(activity)
            
            onReady(rootView)
        }, ContextCompat.getMainExecutor(activity))
    }
    
    private fun bindPreview(activity: Activity) {
        val provider = cameraProvider ?: return
        val pv = previewView ?: return
        
        val preview = Preview.Builder().build().apply {
            setSurfaceProvider(pv.surfaceProvider)
        }
        
        val cameraSelector = CameraSelector.Builder()
            .requireLensFacing(CameraSelector.LENS_FACING_BACK)
            .build()
        
        val imageAnalysis = ImageAnalysis.Builder()
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .build()
        
        executor?.let { exec ->
            imageAnalysis.setAnalyzer(exec) { imageProxy ->
                processImageProxy(imageProxy)
            }
        }
        
        provider.bindToLifecycle(activity as LifecycleOwner, cameraSelector, preview, imageAnalysis)
    }
    
    private var onScanSuccess: ((String) -> Unit)? = null
    private var onScanFail: ((String) -> Unit)? = null
    
    fun setCallbacks(onSuccess: (String) -> Unit, onFail: (String) -> Unit) {
        onScanSuccess = onSuccess
        onScanFail = onFail
    }
    
    private fun processImageProxy(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image
        if (mediaImage == null) {
            imageProxy.close()
            return
        }
        
        val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
        scanner?.process(image)
            ?.addOnSuccessListener { barcodes ->
                if (barcodes.isNotEmpty()) {
                    barcodes[0].rawValue?.let { result ->
                        onScanSuccess?.invoke(result)
                    }
                }
                imageProxy.close()
            }
            ?.addOnFailureListener { e ->
                onScanFail?.invoke(e.message ?: "Scan failed")
                imageProxy.close()
            }
    }
    
    fun processGalleryImage(activity: Activity, imageUri: Uri) {
        try {
            val image = InputImage.fromFilePath(activity, imageUri)
            scanner?.process(image)
                ?.addOnSuccessListener { barcodes ->
                    if (barcodes.isNotEmpty()) {
                        barcodes[0].rawValue?.let { onScanSuccess?.invoke(it) }
                    } else {
                        onScanFail?.invoke("No QR code found in image")
                    }
                }
                ?.addOnFailureListener { e ->
                    onScanFail?.invoke(e.message ?: "Failed to scan image")
                }
        } catch (e: Exception) {
            onScanFail?.invoke("Error processing image")
        }
    }
    
    fun openGallery(activity: Activity, requestCode: Int) {
        val packages = listOf(
            "com.google.android.apps.photos",
            "com.miui.gallery",
            "com.android.gallery3d",
            "com.samsung.android.gallery3d",
            "com.huawei.photos",
            "com.oppo.gallery3d",
            "com.vivo.gallery"
        )
        
        val intent = Intent(Intent.ACTION_PICK).apply { type = "image/*" }
        
        for (pkg in packages) {
            try {
                intent.setPackage(pkg)
                if (activity.packageManager.resolveActivity(intent, 0) != null) {
                    activity.startActivityForResult(intent, requestCode)
                    return
                }
            } catch (_: Exception) {}
        }
        
        activity.startActivityForResult(Intent(Intent.ACTION_PICK).apply { type = "image/*" }, requestCode)
    }
    
    fun cleanup(activity: Activity?) {
        cameraProvider?.unbindAll()
        cameraProvider = null
        
        executor?.shutdown()
        executor = null
        
        scanner?.close()
        scanner = null
        
        activity?.let {
            val rootView = it.window.decorView.findViewById<FrameLayout>(android.R.id.content)
            previewView?.let { v -> rootView.removeView(v) }
            backButton?.let { v -> rootView.removeView(v) }
            galleryButton?.let { v -> rootView.removeView(v) }
        }
        
        previewView = null
        backButton = null
        galleryButton = null
        onScanSuccess = null
        onScanFail = null
    }
    
    // UI Components
    private fun createBackButton(activity: Activity, onClick: () -> Unit): ImageButton {
        val dp = activity.resources.displayMetrics.density
        return ImageButton(activity).apply {
            setImageBitmap(createBackIcon((24 * dp).toInt()))
            scaleType = ImageView.ScaleType.CENTER
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#80000000"))
                cornerRadius = 24 * dp
            }
            layoutParams = FrameLayout.LayoutParams((48 * dp).toInt(), (48 * dp).toInt()).apply {
                gravity = Gravity.TOP or Gravity.START
                setMargins((24 * dp).toInt(), (60 * dp).toInt(), 0, 0)
            }
            setOnClickListener { onClick() }
        }
    }
    
    private fun createGalleryButton(activity: Activity, onClick: () -> Unit): ImageButton {
        val dp = activity.resources.displayMetrics.density
        return ImageButton(activity).apply {
            setImageBitmap(createGalleryIcon((24 * dp).toInt()))
            scaleType = ImageView.ScaleType.CENTER
            background = GradientDrawable().apply {
                setColor(Color.parseColor("#80000000"))
                cornerRadius = 28 * dp
            }
            layoutParams = FrameLayout.LayoutParams((56 * dp).toInt(), (56 * dp).toInt()).apply {
                gravity = Gravity.BOTTOM or Gravity.END
                setMargins(0, 0, (24 * dp).toInt(), (80 * dp).toInt())
            }
            setOnClickListener { onClick() }
        }
    }
    
    private fun createBackIcon(size: Int): Bitmap {
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint().apply {
            color = Color.WHITE
            style = Paint.Style.STROKE
            strokeWidth = 3f
            isAntiAlias = true
            strokeCap = Paint.Cap.ROUND
            strokeJoin = Paint.Join.ROUND
        }
        val centerY = size / 2f
        canvas.drawLine(size * 0.7f, centerY, size * 0.3f, centerY, paint)
        canvas.drawLine(size * 0.3f, centerY, size * 0.45f, centerY - size * 0.2f, paint)
        canvas.drawLine(size * 0.3f, centerY, size * 0.45f, centerY + size * 0.2f, paint)
        return bitmap
    }
    
    private fun createGalleryIcon(size: Int): Bitmap {
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        val paint = Paint().apply {
            color = Color.WHITE
            strokeWidth = 2f
            isAntiAlias = true
        }
        val padding = size * 0.15f
        
        paint.style = Paint.Style.STROKE
        canvas.drawRoundRect(RectF(padding, padding, size - padding, size - padding), 3f, 3f, paint)
        
        paint.style = Paint.Style.FILL
        val path = Path().apply {
            moveTo(padding + (size - 2 * padding) * 0.2f, size - padding - (size - 2 * padding) * 0.2f)
            lineTo(padding + (size - 2 * padding) * 0.5f, padding + (size - 2 * padding) * 0.4f)
            lineTo(size - padding, size - padding - (size - 2 * padding) * 0.2f)
        }
        canvas.drawPath(path, paint)
        canvas.drawCircle(size - padding - (size - 2 * padding) * 0.25f, padding + (size - 2 * padding) * 0.25f, (size - 2 * padding) * 0.12f, paint)
        
        return bitmap
    }
}
