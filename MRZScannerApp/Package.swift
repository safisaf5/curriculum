// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "MRZScannerApp",
    platforms: [
        .iOS(.v17)
    ],
    dependencies: [
        .package(url: "https://github.com/romanmazeev/MRZScanner", from: "1.2.0")
    ],
    targets: [
        .executableTarget(
            name: "MRZScannerApp",
            dependencies: ["MRZScanner"],
            path: "MRZScannerApp",
            resources: [
                .process("Resources")
            ]
        )
    ]
)
