$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$srcPath = "assets\images\Jhoppinglogo.png"
$outDir = "assets\images"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$src = [System.Drawing.Bitmap]::FromFile((Resolve-Path $srcPath))
$bmp = New-Object System.Drawing.Bitmap($src)

$minX = 999; $minY = 999; $maxX = -1; $maxY = -1
for ($x = 0; $x -lt $bmp.Width; $x++) {
  for ($y = 0; $y -lt $bmp.Height; $y++) {
    if ($bmp.GetPixel($x, $y).A -gt 128) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
$bmp.Dispose()

$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1
Write-Host "Logo content bbox: ($minX,$minY) ${cropW}x${cropH}"

$content = New-Object System.Drawing.Bitmap($cropW, $cropH)
$g = [System.Drawing.Graphics]::FromImage($content)
$g.DrawImage(
  $src,
  (New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)),
  (New-Object System.Drawing.Rectangle($minX, $minY, $cropW, $cropH)),
  [System.Drawing.GraphicsUnit]::Pixel
)
$g.Dispose()

$mono = New-Object System.Drawing.Bitmap($cropW, $cropH)
for ($x = 0; $x -lt $cropW; $x++) {
  for ($y = 0; $y -lt $cropH; $y++) {
    $c = $content.GetPixel($x, $y)
    $mono.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($c.A, 255, 255, 255))
  }
}

function Save-Icon {
  param(
    [int]$Size,
    [double]$ContentFraction,
    [string]$Path,
    [switch]$Transparent,
    [switch]$Circle,
    [System.Drawing.Bitmap]$Artwork
  )

  $canvas = New-Object System.Drawing.Bitmap($Size, $Size)
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::Transparent)

  if ($Circle) {
    $circlePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $circlePath.AddEllipse(0, 0, $Size, $Size)
    $circleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillPath($circleBrush, $circlePath)
    $circleBrush.Dispose()
    $circlePath.Dispose()
  } elseif (-not $Transparent) {
    $g.Clear([System.Drawing.Color]::White)
  }

  $longest = [Math]::Max($Artwork.Width, $Artwork.Height)
  $target = [int]($Size * $ContentFraction)
  $scale = $target / $longest
  $w = [int][Math]::Round($Artwork.Width * $scale)
  $h = [int][Math]::Round($Artwork.Height * $scale)
  $x = [int](($Size - $w) / 2)
  $y = [int](($Size - $h) / 2)
  $g.DrawImage($Artwork, (New-Object System.Drawing.Rectangle($x, $y, $w, $h)))
  $g.Dispose()

  $canvas.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Dispose()
  Write-Host "Saved $Path"
}

Save-Icon -Size 1024 -ContentFraction 0.62 -Path (Join-Path $outDir "icon.png") -Circle -Artwork $content
Save-Icon -Size 512 -ContentFraction 0.62 -Path (Join-Path $outDir "android-icon-foreground.png") -Transparent -Artwork $content

$bg = New-Object System.Drawing.Bitmap(512, 512)
$bgG = [System.Drawing.Graphics]::FromImage($bg)
$bgG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$bgG.Clear([System.Drawing.Color]::Transparent)
$bgPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$bgPath.AddEllipse(0, 0, 512, 512)
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$bgG.FillPath($bgBrush, $bgPath)
$bgBrush.Dispose()
$bgPath.Dispose()
$bgG.Dispose()
$bg.Save((Join-Path $outDir "android-icon-background.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bg.Dispose()
Write-Host "Saved android-icon-background.png"

Save-Icon -Size 432 -ContentFraction 0.62 -Path (Join-Path $outDir "android-icon-monochrome.png") -Transparent -Artwork $mono
Save-Icon -Size 48 -ContentFraction 0.62 -Path (Join-Path $outDir "favicon.png") -Circle -Artwork $content
Save-Icon -Size 1024 -ContentFraction 0.62 -Path (Join-Path $outDir "splash-icon.png") -Circle -Artwork $content

$content.Dispose()
$mono.Dispose()
$src.Dispose()
