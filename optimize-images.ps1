# Image optimization script for AlansCinematics
# Generates resized JPEG derivatives at multiple breakpoints
# Usage: powershell -ExecutionPolicy Bypass -File optimize-images.ps1

Add-Type -AssemblyName System.Drawing

$srcDir = Join-Path $PSScriptRoot "images"
$outDir = Join-Path $srcDir "opt"
$sizes = @(400, 800, 1200, 1920)
$jpegQuality = 82

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

# JPEG encoder with quality param
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$jpegQuality)

# Process all images except texture-overlay and the opt directory itself
$files = Get-ChildItem -Path $srcDir -File | Where-Object {
    $_.Name -ne "texture-overlay.jpg" -and
    $_.Extension -match '\.(jpg|jpeg|png|JPG|JPEG|PNG)$'
}

foreach ($file in $files) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    # Sanitize: replace spaces with hyphens, lowercase
    $safeName = $baseName.ToLower() -replace '\s+', '-'

    try {
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $origW = $img.Width
        $origH = $img.Height

        foreach ($targetW in $sizes) {
            if ($targetW -ge $origW) {
                # Skip sizes larger than original; generate one at original size
                if ($targetW -eq ($sizes | Where-Object { $_ -ge $origW } | Select-Object -First 1)) {
                    $targetW = $origW
                    $outName = "${safeName}-${targetW}w.jpg"
                    $outPath = Join-Path $outDir $outName
                    if (Test-Path $outPath) { continue }
                    $newH = $origH
                    $bmp = New-Object System.Drawing.Bitmap($img, $targetW, $newH)
                    $bmp.Save($outPath, $jpegCodec, $encoderParams)
                    $bmp.Dispose()
                    Write-Host "  -> $outName (original size)"
                }
                continue
            }

            $outName = "${safeName}-${targetW}w.jpg"
            $outPath = Join-Path $outDir $outName

            if (Test-Path $outPath) {
                Write-Host "  [skip] $outName (exists)"
                continue
            }

            $ratio = $origH / $origW
            $newH = [int]($targetW * $ratio)

            $bmp = New-Object System.Drawing.Bitmap($img, $targetW, $newH)
            $bmp.Save($outPath, $jpegCodec, $encoderParams)
            $bmp.Dispose()
            Write-Host "  -> $outName (${targetW}x${newH})"
        }

        $img.Dispose()
        Write-Host "Done: $($file.Name)"
    }
    catch {
        Write-Host "ERROR processing $($file.Name): $_"
    }
}

Write-Host "`nAll done! Optimized images are in: $outDir"
