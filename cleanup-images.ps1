# PowerShell script to remove unused images
$imgesPath = "src\imges"

# List of unused images to remove
$unusedImages = @(
    "stylehub_video.mp4",
    "stylehub_video2.mp4",
    "homepage_img3.jpg",
    "homepage_img4.jpg", 
    "homepage_img5.jpg",
    "homepage_img6.jpg",
    "homepage_img7.jpg",
    "homepage_img8.jpg",
    "jon-ly-UIPjy2XRoJQ-unsplash.jpg",
    "clark-street-mercantile-qnKhZJPKFD8-unsplash.jpg",
    "children_cloth3.png",
    "children_cloth4.png",
    "children_cloth5.png",
    "children_cloth6.png",
    "children_cloth7.png",
    "children_cloth9.png",
    "children_cloth10.png",
    "children_cloth11.png",
    "children_categories2.png",
    "children_categories3.png",
    "women_cloth3.png",
    "women_cloth4.png",
    "women_cloth5.png",
    "women_cloth6.png",
    "women_categories2.png",
    "men_shirt1.png",
    "men_shirt2.png",
    "men_shirt5.png",
    "men_shirt6.png",
    "stylehub.png",
    "stylehub2.png",
    "stylehub3.png",
    "login_image.png",
    "relateditem.png",
    "tuxedo.png",
    "anarkali.jpg",
    "indo_western.png",
    "sherwani.jpg",
    "gown.jpg",
    "lehenga.jpg",
    "mumbai.png",
    "surat.png",
    "ahmedabad.png",
    "pune.png",
    "jaipur.png",
    "chennai.png",
    "kolkata.png",
    "hyderabad.png",
    "delhi.png",
    "bengluru.png",
    "rajkot.png",
    "ludhiyana.png",
    "xxl-chataifull01-green-ganesh-enterprise-original-imagymf9nc4keaxr.webp"
)

Write-Host "Starting cleanup of unused images..." -ForegroundColor Green

$removedCount = 0
$totalSizeSaved = 0

foreach ($image in $unusedImages) {
    $filePath = Join-Path $imgesPath $image
    if (Test-Path $filePath) {
        try {
            $fileSize = (Get-Item $filePath).Length
            $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
            
            Remove-Item $filePath -Force
            $removedCount++
            $totalSizeSaved += $fileSizeMB
            
            Write-Host "✅ Removed: $image ($fileSizeMB MB)" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to remove: $image - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️ File not found: $image" -ForegroundColor Yellow
    }
}

Write-Host "`n📊 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "   • Files removed: $removedCount" -ForegroundColor White
Write-Host "   • Space saved: $totalSizeSaved MB" -ForegroundColor White

# Show remaining files
$remainingFiles = Get-ChildItem $imgesPath | Select-Object -ExpandProperty Name
Write-Host "   • Files remaining: $($remainingFiles.Count)" -ForegroundColor White

Write-Host "`n✅ Cleanup completed!" -ForegroundColor Green
