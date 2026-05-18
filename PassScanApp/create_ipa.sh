#!/bin/bash
set -e

PROJECT_DIR="$HOME/Desktop/Projet en cours/Tech et Dev/PassScan/PassScanApp"
DERIVED_DATA="/tmp/mrzbuild_ipa"
BUNDLE_ID="app.turquoise6929.taro1209"
SIGN_IDENTITY="iPhone Distribution: Imelda Ladner (FYY97XBYAR)"
TEAM_ID="FYY97XBYAR"
PROV_PROFILE="$HOME/Library/MobileDevice/Provisioning Profiles/00008140-001978D03C69801C.mobileprovision"
INFO_PLIST="$PROJECT_DIR/PassScanApp/Info.plist"
OUTPUT_IPA="$HOME/Desktop/PassScan.ipa"

echo "=== Step 1: Clean build ==="
rm -rf "$DERIVED_DATA"
cd "$PROJECT_DIR"

xcodebuild build \
    -scheme PassScanApp \
    -destination 'generic/platform=iOS' \
    -skipPackagePluginValidation \
    -skipMacroValidation \
    -derivedDataPath "$DERIVED_DATA" \
    PRODUCT_BUNDLE_IDENTIFIER="$BUNDLE_ID" \
    CODE_SIGN_IDENTITY="$SIGN_IDENTITY" \
    DEVELOPMENT_TEAM="$TEAM_ID" \
    CODE_SIGN_STYLE=Manual \
    PROVISIONING_PROFILE_SPECIFIER="" \
    INFOPLIST_FILE="$INFO_PLIST" \
    GENERATE_INFOPLIST_FILE=NO \
    2>&1 | tail -5

echo ""
echo "=== Step 2: Find binary ==="
BINARY=$(find "$DERIVED_DATA" -name "PassScanApp" -type f -perm +111 ! -name "*.swift" ! -name "*.d" ! -path "*/Intermediates*" 2>/dev/null | head -1)
echo "Binary: $BINARY"

if [ -z "$BINARY" ]; then
    echo "Trying broader search..."
    find "$DERIVED_DATA/Build/Products" -type f 2>/dev/null
    exit 1
fi

echo ""
echo "=== Step 3: Create .app bundle ==="
APP_DIR="/tmp/PassScan.app"
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"

# Copy binary
cp "$BINARY" "$APP_DIR/PassScanApp"

# Copy compiled assets (includes app icon)
ASSETS_CAR=$(find "$DERIVED_DATA" -name "Assets.car" -path "*/Debug-iphoneos/*" 2>/dev/null | head -1)
if [ -n "$ASSETS_CAR" ]; then
    cp "$ASSETS_CAR" "$APP_DIR/Assets.car"
    echo "Copied Assets.car from: $ASSETS_CAR"
fi

# Copy Info.plist
cp "$INFO_PLIST" "$APP_DIR/Info.plist"

# Add CFBundleExecutable to Info.plist if missing
/usr/libexec/PlistBuddy -c "Add :CFBundleExecutable string PassScanApp" "$APP_DIR/Info.plist" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :CFBundleExecutable PassScan" "$APP_DIR/Info.plist"

# Add CFBundlePackageType
/usr/libexec/PlistBuddy -c "Add :CFBundlePackageType string APPL" "$APP_DIR/Info.plist" 2>/dev/null || true

# Add LSRequiresIPhoneOS
/usr/libexec/PlistBuddy -c "Add :LSRequiresIPhoneOS bool true" "$APP_DIR/Info.plist" 2>/dev/null || true

# Add UILaunchScreen (required for modern iOS)
/usr/libexec/PlistBuddy -c "Add :UILaunchScreen dict" "$APP_DIR/Info.plist" 2>/dev/null || true

# Add UISupportedInterfaceOrientations
/usr/libexec/PlistBuddy -c "Add :UISupportedInterfaceOrientations array" "$APP_DIR/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :UISupportedInterfaceOrientations:0 string UIInterfaceOrientationPortrait" "$APP_DIR/Info.plist" 2>/dev/null || true

# Copy app icon files directly (SPM doesn't include AppIcon in Assets.car)
ICON_DIR="$PROJECT_DIR/PassScanApp/Resources/RuntimeIcons"
if [ -d "$ICON_DIR" ]; then
    cp "$ICON_DIR/120.png" "$APP_DIR/AppIcon60x60@2x.png" 2>/dev/null || true
    cp "$ICON_DIR/180.png" "$APP_DIR/AppIcon60x60@3x.png" 2>/dev/null || true
    cp "$ICON_DIR/76.png"  "$APP_DIR/AppIcon76x76.png" 2>/dev/null || true
    cp "$ICON_DIR/152.png" "$APP_DIR/AppIcon76x76@2x.png" 2>/dev/null || true
    cp "$ICON_DIR/167.png" "$APP_DIR/AppIcon83.5x83.5@2x.png" 2>/dev/null || true
    echo "Copied app icon files"
fi

# Add CFBundleIcons to Info.plist
/usr/libexec/PlistBuddy -c "Add :CFBundleIcons dict" "$APP_DIR/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleIcons:CFBundlePrimaryIcon dict" "$APP_DIR/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleIcons:CFBundlePrimaryIcon:CFBundleIconFiles array" "$APP_DIR/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleIcons:CFBundlePrimaryIcon:CFBundleIconFiles:0 string AppIcon60x60" "$APP_DIR/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleIcons:CFBundlePrimaryIcon:CFBundleIconFiles:1 string AppIcon76x76" "$APP_DIR/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Add :CFBundleIcons:CFBundlePrimaryIcon:CFBundleIconFiles:2 string AppIcon83.5x83.5" "$APP_DIR/Info.plist" 2>/dev/null || true

# Copy provisioning profile
cp "$PROV_PROFILE" "$APP_DIR/embedded.mobileprovision"

echo ""
echo "=== Step 4: Sign the app ==="
codesign --force --sign "$SIGN_IDENTITY" --entitlements /dev/stdin "$APP_DIR" <<ENTITLEMENTS
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>application-identifier</key>
    <string>${TEAM_ID}.${BUNDLE_ID}</string>
    <key>com.apple.developer.team-identifier</key>
    <string>${TEAM_ID}</string>
    <key>get-task-allow</key>
    <false/>
</dict>
</plist>
ENTITLEMENTS

echo ""
echo "=== Step 5: Create IPA ==="
rm -rf /tmp/ipa_build
mkdir -p /tmp/ipa_build/Payload
cp -r "$APP_DIR" /tmp/ipa_build/Payload/
cd /tmp/ipa_build
rm -f "$OUTPUT_IPA"
zip -qr "$OUTPUT_IPA" Payload
rm -rf /tmp/ipa_build

echo ""
echo "=== DONE ==="
echo "IPA created at: $OUTPUT_IPA"
ls -lh "$OUTPUT_IPA"
